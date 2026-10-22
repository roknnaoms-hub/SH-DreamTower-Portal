import fs from "fs/promises";
import { randomUUID } from "node:crypto";
import path from "path";

const dataPath = process.env.DATA_PATH || path.resolve(process.cwd(), "data", "tenants.json");

export async function readDatabase() {
  const file = await fs.readFile(dataPath, "utf8");
  // PowerShell Set-Content may write UTF-8 BOM; strip it before parsing.
  const normalized = file.replace(/^\uFEFF/, "");
  return JSON.parse(normalized);
}

export async function writeDatabase(nextData) {
  const temporaryPath = `${dataPath}.${randomUUID()}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(nextData, null, 2), { encoding: "utf8", mode: 0o600 });
  await fs.rename(temporaryPath, dataPath);
}
