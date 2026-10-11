import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(100),
  birthDate: z.string().optional().transform((value) => value || undefined),
  gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "UNDISCLOSED"]).optional(),
  mobileNumber: z.string().trim().min(10).max(20), email: z.string().email().optional().or(z.literal("")),
  medicalAlerts: z.array(z.string().trim().min(1)).default([]), allergies: z.array(z.string().trim().min(1)).default([]),
  seniorPwdId: z.string().trim().max(80).optional().or(z.literal("")),
});
export type PatientInput = z.infer<typeof patientSchema>;
