import { z } from "zod";

export const inventoryItemSchema = z.object({ sku: z.string().trim().max(60).optional(), name: z.string().trim().min(2).max(200), category: z.string().trim().min(2).max(60), unit: z.string().trim().min(1).max(30), quantity: z.coerce.number().min(0).max(1000000), reorderLevel: z.coerce.number().min(0).max(1000000), unitCost: z.coerce.number().min(0).max(100000000).optional(), expiresAt: z.string().optional() });
export const stockMovementSchema = z.object({ itemId: z.string().uuid(), kind: z.enum(["RECEIVE", "USE", "ADJUST", "WASTE"]), quantity: z.coerce.number().positive().max(1000000), reference: z.string().trim().max(100).optional(), note: z.string().trim().max(1000).optional() });
