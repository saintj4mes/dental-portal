import { z } from "zod";
export const clinicSchema = z.object({ name: z.string().trim().min(2).max(180), taxId: z.string().trim().max(20).optional(), address: z.string().trim().max(2000).optional(), contactNumber: z.string().trim().max(20).optional(), officialReceiptPrefix: z.string().trim().min(1).max(12), isVatRegistered: z.boolean() });
