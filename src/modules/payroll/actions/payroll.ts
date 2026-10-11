"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { createPayrollSchema, payrollStatusSchema } from "../schemas/payroll";

const createPeriodAction = createSafeAction(createPayrollSchema, async (input) => {
  const clinicId = await getClinicId();
  const period = await db.payrollPeriod.create({ data: { clinicId, name: input.name, periodStart: new Date(`${input.periodStart}T00:00:00.000Z`), periodEnd: new Date(`${input.periodEnd}T00:00:00.000Z`), payDate: input.payDate ? new Date(`${input.payDate}T00:00:00.000Z`) : null, entries: { create: input.entries.map((entry) => {
    const grossPay = roundMoney(entry.daysWorked * entry.dailyRate + entry.overtimeHours * entry.overtimeRate + entry.commission + entry.allowances);
    const deductions = roundMoney(entry.sssContribution + entry.philhealthContribution + entry.pagibigContribution + entry.withholdingTax);
    if (deductions > grossPay) throw new Error(`Deductions exceed gross pay for ${entry.staffName}.`);
    return { ...entry, deductions, grossPay, netPay: roundMoney(grossPay - deductions) };
  }) } }, select: { id: true } });
  revalidatePath("/payroll");
  return { id: period.id };
});

const statusAction = createSafeAction(payrollStatusSchema, async (input) => {
  const clinicId = await getClinicId();
  const period = await db.payrollPeriod.findFirst({ where: { id: input.periodId, clinicId }, select: { id: true, status: true } });
  if (!period) throw new Error("Payroll period was not found.");
  const transitions: Record<string, readonly string[]> = { DRAFT: ["REVIEW"], REVIEW: ["APPROVED"], APPROVED: ["PAID"] };
  if (!transitions[period.status]?.includes(input.status)) throw new Error("Payroll status cannot move to that stage.");
  await db.payrollPeriod.update({ where: { id: period.id }, data: { status: input.status } });
  revalidatePath("/payroll");
  return { updated: true };
});

export async function createPayrollPeriod(input: unknown) { return createPeriodAction(input); }
export async function updatePayrollStatus(input: unknown) { return statusAction(input); }
function roundMoney(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }
