import { z } from "zod";

const siteSchema = z.enum(["MB", "B", "DB", "ML", "L", "DL"]);
export const createExamSchema = z.object({ patientId: z.string().uuid(), notes: z.string().trim().max(2000).optional().default("") });
export const savePeriodontalChartSchema = z.object({
  examId: z.string().uuid(),
  notes: z.string().trim().max(2000).optional().default(""),
  measurements: z.array(z.object({
    toothNumber: z.number().int(), site: siteSchema,
    pocketDepth: z.number().int().min(0).max(15), recession: z.number().int().min(0).max(15),
    bleeding: z.boolean(), suppuration: z.boolean(), mobility: z.number().int().min(0).max(3), furcation: z.number().int().min(0).max(3),
  })).max(168),
});
