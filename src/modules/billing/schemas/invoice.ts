import { z } from "zod";

export const invoiceSchema = z.object({
  patientId: z.string().uuid(), appointmentId: z.string().uuid().optional().or(z.literal("")),
  lineItems: z.array(z.object({ description: z.string().trim().min(1).max(180), quantity: z.number().int().positive().max(100), unitPrice: z.number().min(0) })).min(1).max(30),
  subtotal: z.number().finite().positive(), isVatInclusive: z.boolean(),
  discountType: z.enum(["NONE", "SENIOR_CITIZEN", "PWD", "CUSTOM"]), seniorPwdId: z.string().trim().optional(), customDiscountPercent: z.number().min(0).max(100).default(0),
  hmoProvider: z.string().trim().max(100).optional(), hmoApprovalCode: z.string().trim().max(100).optional(), hmoCoveredAmount: z.number().finite().min(0).default(0),
}).superRefine((value, ctx) => {
  if ((value.discountType === "SENIOR_CITIZEN" || value.discountType === "PWD") && !value.seniorPwdId?.trim()) {
    ctx.addIssue({ code: "custom", path: ["seniorPwdId"], message: "Enter the Senior Citizen or PWD ID." });
  }
  if (value.hmoCoveredAmount > 0 && !value.hmoApprovalCode?.trim()) ctx.addIssue({ code: "custom", path: ["hmoApprovalCode"], message: "Enter the HMO approval code." });
});
