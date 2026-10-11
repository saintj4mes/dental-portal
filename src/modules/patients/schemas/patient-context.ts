import { z } from "zod";

export const relationshipSchema = z.object({
  patientId: z.string().uuid(),
  name: z.string().trim().min(2).max(180),
  relationship: z.string().trim().min(2).max(40),
  mobileNumber: z.string().trim().max(20).optional().default(""),
  email: z.string().trim().email().max(255).or(z.literal("")).optional().default(""),
  isEmergencyContact: z.boolean().default(false),
  isGuardian: z.boolean().default(false),
  notes: z.string().trim().max(1000).optional().default(""),
});

export const communicationSchema = z.object({
  patientId: z.string().uuid(),
  channel: z.enum(["PHONE", "EMAIL", "IN_PERSON", "OTHER"]),
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  subject: z.string().trim().min(2).max(180),
  summary: z.string().trim().max(2000).optional().default(""),
  outcome: z.string().trim().max(40).optional().default(""),
  followUpAt: z.string().optional().default(""),
});

export const contextRecordIdSchema = z.object({ id: z.string().uuid() });
