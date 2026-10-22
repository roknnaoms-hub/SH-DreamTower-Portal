import { z } from "zod";

export const tenantSchema = z.object({
  id: z.string().min(1).max(200),
  floorCode: z.string().min(1).max(200),
  unit: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  category: z.string().default("미분류"),
  phone: z.string().max(4000).default(""),
  email: z.string().max(4000).default(""),
  website: z.string().max(2048).refine(value => !value || /^https?:\/\//i.test(value), "HTTP(S) website required").default(""),
  description: z.string().max(4000).default(""),
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
