import { z } from "zod";

export const appointmentSchema = z.object({
  patientId: z.string().uuid(), dentistId: z.string().uuid(), chairId: z.string().uuid(),
  startTime: z.string().datetime({ offset: true }), endTime: z.string().datetime({ offset: true }),
  reason: z.string().trim().max(500).optional(), status: z.enum(["SCHEDULED", "CONFIRMED"]).default("SCHEDULED"),
});
