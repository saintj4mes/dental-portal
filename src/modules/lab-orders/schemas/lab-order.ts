import { z } from "zod";
const isFdi = (tooth: number) => [1, 2, 3, 4].includes(Math.floor(tooth / 10)) && tooth % 10 >= 1 && tooth % 10 <= 8;
export const createLabOrderSchema = z.object({ patientId: z.string().uuid(), laboratory: z.string().trim().min(2).max(180), appliance: z.string().trim().min(2).max(120), toothNumbers: z.array(z.number().int().refine(isFdi)).max(32), shade: z.string().trim().max(40).optional(), dueAt: z.string().date().optional(), cost: z.number().min(0).max(100000000).optional(), instructions: z.string().trim().max(4000).optional() });
export const updateLabOrderSchema = z.object({ id: z.string().uuid(), status: z.enum(["SENT", "IN_PROGRESS", "READY", "RECEIVED", "CANCELLED"]) });
