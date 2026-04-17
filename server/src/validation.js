import { z } from "zod";

export const tenantSchema = z.object({
  id: z.string().min(1),
  floorCode: z.string().min(1),
  unit: z.string().min(1),
  name: z.string().min(1),
  category: z.string().default("미분류"),
  phone: z.string().default(""),
  email: z.string().default(""),
  website: z.string().default(""),
  description: z.string().default(""),
  status: z.enum(["active", "vacant"]).default("active"),
  updatedAt: z.string().optional(),
});

export const tenantImportSchema = z.array(tenantSchema);

export function normalizeTenant(row, index) {
  return tenantSchema.parse({
    id: String(row.id || `${row.floorCode || row.floor || "F"}-${row.unit || index + 1}`),
    floorCode: String(row.floorCode || row.floor || "").toUpperCase(),
    unit: String(row.unit || ""),
    name: String(row.name || row.company || ""),
    category: String(row.category || row.industry || "미분류"),
    phone: String(row.phone || ""),
    email: String(row.email || ""),
    website: String(row.website || ""),
    description: String(row.description || ""),
    status: String(row.status || "active").toLowerCase(),
    updatedAt: new Date().toISOString(),
  });
}
