import { z } from "zod";

const nonnegative = z.number().min(0).max(100000000);
export const createPayrollSchema = z.object({ name: z.string().trim().min(2).max(100), periodStart: z.string().date(), periodEnd: z.string().date(), payDate: z.string().date().optional(), entries: z.array(z.object({ staffName: z.string().trim().min(2).max(180), daysWorked: nonnegative, dailyRate: nonnegative, overtimeHours: nonnegative, overtimeRate: nonnegative, commission: nonnegative, allowances: nonnegative, sssContribution: nonnegative, philhealthContribution: nonnegative, pagibigContribution: nonnegative, withholdingTax: nonnegative })).min(1).max(250) }).refine((data) => data.periodStart <= data.periodEnd, { message: "Period end must be on or after period start", path: ["periodEnd"] });
export const payrollStatusSchema = z.object({ periodId: z.string().uuid(), status: z.enum(["REVIEW", "APPROVED", "PAID"]) });
