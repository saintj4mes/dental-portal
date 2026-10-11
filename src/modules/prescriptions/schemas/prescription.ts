import { z } from "zod";

export const createPrescriptionSchema = z.object({ patientId: z.string().uuid(), dentistId: z.string().uuid(), validUntil: z.string().date().optional(), diagnosis: z.string().trim().max(500).optional(), notes: z.string().trim().max(2000).optional(), items: z.array(z.object({ medication: z.string().trim().min(2).max(180), strength: z.string().trim().min(1).max(80), dosage: z.string().trim().min(1).max(120), frequency: z.string().trim().min(1).max(120), duration: z.string().trim().min(1).max(80), quantity: z.string().trim().min(1).max(40), instructions: z.string().trim().max(500).optional() })).min(1).max(20) });
export const prescriptionStatusSchema = z.object({ id: z.string().uuid(), status: z.enum(["DISPENSED", "CANCELLED"]) });
