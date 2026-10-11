import { z } from "zod";

export const createOrthoCaseSchema = z.object({ patientId: z.string().uuid(), title: z.string().trim().min(2).max(180), appliance: z.string().trim().min(2).max(100), startedAt: z.string().optional(), targetEndAt: z.string().optional(), notes: z.string().trim().max(4000).optional() });
export const createOrthoVisitSchema = z.object({ caseId: z.string().uuid(), visitedAt: z.string().date(), procedure: z.string().trim().min(2).max(180), notes: z.string().trim().max(3000).optional(), nextVisitAt: z.string().date().optional() });
export const updateOrthoStatusSchema = z.object({ caseId: z.string().uuid(), status: z.enum(["ACTIVE", "RETAINING", "ON_HOLD", "COMPLETED"]) });
