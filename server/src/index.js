import express from "express";
import cors from "cors";
import multer from "multer";
import { createHash, timingSafeEqual } from "node:crypto";
import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { rateLimit } from "express-rate-limit";
import path from "path";
import { readDatabase, writeDatabase } from "./db.js";
import { normalizeTenant } from "./validation.js";

export function createApp({ tokenHash = process.env.ADMIN_TOKEN_SHA256 || "", origins = process.env.ALLOWED_ORIGINS || "" } = {}) {
const app = express();
app.disable("x-powered-by");
// Only a loopback HTTPS reverse proxy may supply X-Forwarded-Proto.
if (process.env.TRUST_LOOPBACK_PROXY === "true") app.set("trust proxy", "loopback");
const allowedOrigins = new Set(origins.split(",").map(value => value.trim()).filter(Boolean));
app.use((_req, res, next) => {
  res.set({ "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'" });
  next();
});
app.use(cors({
  origin: (origin, callback) => callback(null, Boolean(origin && allowedOrigins.has(origin))),
  methods: ["GET", "POST"], allowedHeaders: ["Content-Type", "Authorization"], maxAge: 600,
}));
app.use("/api/admin", rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false }));
app.use("/api/admin", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (req.headers.origin && !allowedOrigins.has(req.headers.origin)) return res.status(403).json({ message: "허용되지 않은 출처입니다." });
  if (!/^[a-f0-9]{64}$/i.test(tokenHash)) return res.status(503).json({ message: "관리자 기능이 아직 설정되지 않았습니다." });
  const supplied = /^Bearer ([A-Za-z0-9_-]{43,128})$/.exec(req.get("Authorization") || "");
  const actualHash = createHash("sha256").update(supplied?.[1] || "").digest();
  if (!supplied || !timingSafeEqual(actualHash, Buffer.from(tokenHash, "hex"))) return res.status(401).json({ message: "관리자 인증이 필요합니다." });
  next();
});
app.use(express.json({ limit: "32kb" }));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 0, parts: 1, headerPairs: 30 },
  fileFilter: (_req, file, cb) => {
    if (!/\.(xlsx|xls|csv)$/i.test(file.originalname)) return cb(Object.assign(new Error("Unsupported upload"), { status: 415 }));
    cb(null, true);
  },
});
app.get("/api/admin/session", (_req, res) => res.json({ authenticated: true }));
let importing = false;
function parseRows(file) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./parse-upload.js", import.meta.url), {
      workerData: { buffer: file.buffer, extension: path.extname(file.originalname).toLowerCase() },
      resourceLimits: { maxOldGenerationSizeMb: 64, maxYoungGenerationSizeMb: 16 },
    });
    const timer = setTimeout(() => { worker.terminate(); reject(Object.assign(new Error("Import timeout"), { status: 422 })); }, 5000);
    worker.once("message", result => { clearTimeout(timer); worker.terminate(); result.error ? reject(Object.assign(new Error("Invalid spreadsheet"), { status: 422 })) : resolve(result.rows); });
    worker.once("error", () => { clearTimeout(timer); reject(Object.assign(new Error("Invalid spreadsheet"), { status: 422 })); });
    worker.once("exit", code => { clearTimeout(timer); if (code !== 0) reject(Object.assign(new Error("Import stopped"), { status: 422 })); });
  });
}

function buildFloors(tenants) {
  const floorMap = new Map();

  tenants.forEach((tenant) => {
    if (!floorMap.has(tenant.floorCode)) {
      floorMap.set(tenant.floorCode, 0);
    }
    floorMap.set(tenant.floorCode, floorMap.get(tenant.floorCode) + 1);
  });

  return Array.from(floorMap.entries())
    .map(([floorCode, tenantCount]) => ({ floorCode, tenantCount }))
    .sort((a, b) => compareFloors(a.floorCode, b.floorCode));
}

function compareFloors(a, b) {
  const parse = (v) => {
    const basementMatch = v.match(/^B(\d+)F$/i);
    if (basementMatch) {
      return -Number(basementMatch[1]);
    }

    const groundMatch = v.match(/^(\d+)F$/i);
    if (groundMatch) {
      return Number(groundMatch[1]);
    }

    return -999;
  };

  return parse(b) - parse(a);
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", at: new Date().toISOString() });
});

app.get("/api/floors", async (_req, res) => {
  const data = await readDatabase();
  const floors = buildFloors(data.tenants);

  res.json({
    buildingName: data.buildingName,
    updatedAt: data.updatedAt,
    floors,
  });
});

app.get("/api/floors/:floorCode/tenants", async (req, res) => {
  const floorCode = String(req.params.floorCode).toUpperCase();
  const data = await readDatabase();

  const tenants = data.tenants
    .filter((tenant) => tenant.floorCode === floorCode)
    .sort((a, b) => a.unit.localeCompare(b.unit));

  res.json({ floorCode, count: tenants.length, tenants });
});

app.get("/api/tenants", async (req, res) => {
  const data = await readDatabase();
  const keyword = String(req.query.keyword || "").trim().toLowerCase();
  const category = String(req.query.category || "").trim().toLowerCase();

  let tenants = [...data.tenants];

  if (keyword) {
    tenants = tenants.filter((tenant) => {
      return [tenant.name, tenant.unit, tenant.floorCode, tenant.description]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }

  if (category) {
    tenants = tenants.filter((tenant) => tenant.category.toLowerCase() === category);
  }

  res.json({ count: tenants.length, tenants });
});

app.get("/api/tenants/:id", async (req, res) => {
  const data = await readDatabase();
  const tenant = data.tenants.find((item) => item.id === req.params.id);

  if (!tenant) {
    res.status(404).json({ message: "Tenant not found" });
    return;
  }

  res.json(tenant);
});

app.post("/api/admin/tenants", async (req, res) => {
  const payload = req.body || {};
  const normalized = normalizeTenant(payload, 0);
  const data = await readDatabase();

  const nextTenants = data.tenants.filter((tenant) => tenant.id !== normalized.id);
  nextTenants.push(normalized);

  const nextData = {
    ...data,
    tenants: nextTenants,
    updatedAt: new Date().toISOString(),
  };

  await writeDatabase(nextData);
  res.status(201).json({ message: "Saved", tenant: normalized });
});

app.post("/api/admin/tenants/import", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "파일이 없습니다. file 필드로 업로드하세요." });
    return;
  }

  if (importing) return res.status(429).json({ message: "다른 업로드가 진행 중입니다." });
  importing = true;
  try {
  const rows = await parseRows(req.file);
  if (!rows.length || rows.length > 2000) return res.status(422).json({ message: "1~2,000행만 업로드할 수 있습니다." });
  const data = await readDatabase();
  const imported = rows
    .map((row, index) => normalizeTenant(row, index))
    .filter((tenant) => tenant.floorCode && tenant.unit && tenant.name);

  const mergedMap = new Map();
  data.tenants.forEach((tenant) => mergedMap.set(tenant.id, tenant));
  imported.forEach((tenant) => mergedMap.set(tenant.id, tenant));

  const nextData = {
    ...data,
    tenants: Array.from(mergedMap.values()),
    updatedAt: new Date().toISOString(),
  };

  await writeDatabase(nextData);

  res.json({
    message: "Import completed",
    importedCount: imported.length,
    totalCount: nextData.tenants.length,
  });
  } finally { importing = false; }
});

app.use((error, _req, res, _next) => {
  const status = error instanceof multer.MulterError ? (error.code === "LIMIT_FILE_SIZE" ? 413 : 400)
    : error.name === "ZodError" ? 422 : (error.status >= 400 && error.status < 500 ? error.status : 500);
  // Never log request headers, tokens, uploaded rows, or parser error details.
  console.error(`API request failed (${status})`);
  res.status(status).json({ message: status === 500 ? "서버 처리 오류입니다." : "입력 형식 또는 허용 크기를 확인하세요." });
});
return app;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const port = Number(process.env.PORT || 4100);
  const host = process.env.HOST || "127.0.0.1";
  createApp().listen(port, host, () => console.log(`SH Dreamtower API listening on ${host}:${port}`));
}
