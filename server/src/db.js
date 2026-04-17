import fs from "fs/promises";
import path from "path";

const dataPath = path.resolve(process.cwd(), "data", "tenants.json");

export async function readDatabase() {
  const file = await fs.readFile(dataPath, "utf8");
  // PowerShell Set-Content may write UTF-8 BOM; strip it before parsing.
  const normalized = file.replace(/^\uFEFF/, "");
  return JSON.parse(normalized);
}

export async function writeDatabase(nextData) {
  await fs.writeFile(dataPath, JSON.stringify(nextData, null, 2), "utf8");
}
