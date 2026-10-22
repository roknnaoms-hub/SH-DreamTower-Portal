import { parentPort, workerData } from "node:worker_threads";
import XLSX from "xlsx";
try {
  const buffer = Buffer.from(workerData.buffer);
  const ext = workerData.extension;
  if (ext === ".xlsx" && buffer.readUInt32LE(0) !== 0x04034b50) throw new Error("Invalid ZIP");
  if (ext === ".xls" && buffer.subarray(0, 8).toString("hex") !== "d0cf11e0a1b11ae1") throw new Error("Invalid XLS");
  if (ext === ".csv" && buffer.includes(0)) throw new Error("Invalid CSV");
  const workbook = XLSX.read(buffer, { type: "buffer", dense: true, sheetRows: 2002, cellFormula: false, cellHTML: false, sheets: 0 });
  if (!workbook.SheetNames.length) throw new Error("No sheet");
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "", raw: false });
  parentPort.postMessage({ rows });
} catch { parentPort.postMessage({ error: true }); }
