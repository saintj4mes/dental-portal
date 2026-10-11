import { z } from "zod";
export const clinicalNoteSchema = z.object({
  patientId: z.string().uuid(), appointmentId: z.string().uuid().optional().or(z.literal("")),
  subjective: z.string().trim().min(1).max(10000), objective: z.string().trim().min(1).max(10000),
  assessment: z.string().trim().min(1).max(10000), plan: z.string().trim().min(1).max(10000),
  toothNumbers: z.array(z.number().int().min(11).max(85)).default([]),
});
export const treatmentPlanSchema = z.object({
  patientId: z.string().uuid(), title: z.string().trim().min(1).max(180),
  status: z.enum(["DRAFT", "PRESENTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "DECLINED"]).default("DRAFT"),
  items: z.array(z.object({ treatmentId: z.string().uuid().optional().or(z.literal("")), name: z.string().trim().min(1).max(180), toothNumbers: z.array(z.number().int().min(11).max(85)).default([]), quantity: z.number().int().positive().max(100), unitPrice: z.number().min(0) })).min(1),
});
