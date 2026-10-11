import { z } from "zod";

const validFdi = (tooth: number) => { const quadrant = Math.floor(tooth / 10); const position = tooth % 10; return quadrant >= 1 && quadrant <= 4 && position >= 1 && position <= 8; };
export const createBudgetSchema = z.object({ patientId: z.string().uuid(), title: z.string().trim().min(2).max(180), validUntil: z.string().optional(), patientNotes: z.string().trim().max(2000).optional(), items: z.array(z.object({ name: z.string().trim().min(2).max(180), toothNumbers: z.array(z.number().int().refine(validFdi)).max(32), quantity: z.number().int().min(1).max(1000), unitPrice: z.number().min(0).max(10000000) })).min(1).max(100) });
export const budgetStatusSchema = z.object({ budgetId: z.string().uuid(), status: z.enum(["PRESENTED", "IN_PROGRESS", "COMPLETED", "DECLINED"]) });
export const acceptBudgetSchema = z.object({ token: z.string().uuid(), acceptedBy: z.string().trim().min(2).max(180) });
