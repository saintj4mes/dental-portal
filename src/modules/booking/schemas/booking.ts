import { z } from "zod";

const mobilePattern = /^(?:\+?63|0)9\d{9}$/;
export const publicBookingSchema = z.object({ clinicId: z.string().uuid(), patientName: z.string().trim().min(2).max(180), mobileNumber: z.string().trim().regex(mobilePattern, "Enter a Philippine mobile number such as 09171234567."), email: z.string().trim().email().max(255).optional().or(z.literal("")), requestedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/), reason: z.string().trim().max(1000).optional(), website: z.string().max(0).optional().default("") });
export const approveBookingSchema = z.object({ requestId: z.string().uuid(), dentistId: z.string().uuid(), chairId: z.string().uuid() });
export const declineBookingSchema = z.object({ requestId: z.string().uuid() });
