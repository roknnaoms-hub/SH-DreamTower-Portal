import express from "express";
import cors from "cors";
import multer from "multer";
import XLSX from "xlsx";
import fs from "fs/promises";
import path from "path";
import { readDatabase, writeDatabase } from "./db.js";
import { normalizeTenant } from "./validation.js";

const app = express();
const PORT = process.env.PORT || 4100;
const uploadDir = path.resolve(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

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

  const data = await readDatabase();
  const workbook = XLSX.readFile(req.file.path);
  const firstSheet = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheet];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

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
  await fs.unlink(req.file.path).catch(() => {});

  res.json({
    message: "Import completed",
    importedCount: imported.length,
    totalCount: nextData.tenants.length,
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Server error", detail: error.message });
});

app.listen(PORT, () => {
  console.log(`SH Dreamtower API running on http://localhost:${PORT}`);
});
