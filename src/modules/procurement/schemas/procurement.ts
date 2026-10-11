import { z } from "zod";

export const supplierSchema = z.object({ name: z.string().trim().min(2).max(180), contactName: z.string().trim().max(180).optional(), mobileNumber: z.string().trim().max(20).optional(), email: z.string().trim().email().max(255).optional().or(z.literal("")), tin: z.string().trim().max(30).optional(), address: z.string().trim().max(1000).optional() });
export const purchaseOrderSchema = z.object({ supplierId: z.string().uuid(), expectedAt: z.string().optional(), notes: z.string().trim().max(2000).optional(), lines: z.array(z.object({ itemId: z.string().uuid(), quantityOrdered: z.number().positive().max(1000000), unitCost: z.number().min(0).max(100000000) })).min(1).max(100) });
export const receiveOrderLineSchema = z.object({ lineId: z.string().uuid(), quantity: z.number().positive().max(1000000), reference: z.string().trim().max(100).optional() });
