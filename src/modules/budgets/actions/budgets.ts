"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { acceptBudgetSchema, budgetStatusSchema, createBudgetSchema } from "../schemas/budget";

const createAction = createSafeAction(createBudgetSchema, async (input) => {
  const clinicId = await getClinicId();
  const patient = await db.patient.findFirst({ where: { id: input.patientId, clinicId }, select: { id: true } });
  if (!patient) throw new Error("Patient record was not found in this clinic.");
  const lines = input.items.map((item) => ({ ...item, lineTotal: Math.round(item.quantity * item.unitPrice * 100) / 100 }));
  const subtotal = Math.round(lines.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
  const budget = await db.treatmentBudget.create({ data: { clinicId, patientId: patient.id, budgetNumber: `EST-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, title: input.title, validUntil: input.validUntil ? new Date(`${input.validUntil}T00:00:00.000Z`) : null, patientNotes: input.patientNotes || null, subtotal, total: subtotal, items: { create: lines } }, select: { id: true, publicToken: true } });
  revalidatePath("/budgets");
  return { id: budget.id, sharePath: `/estimate/${budget.publicToken}` };
});

const changeStatusAction = createSafeAction(budgetStatusSchema, async (input) => {
  const clinicId = await getClinicId();
  const changed = await db.treatmentBudget.updateMany({ where: { id: input.budgetId, clinicId, status: { not: "ACCEPTED" } }, data: { status: input.status } });
  if (!changed.count) throw new Error("Estimate was not found or has already been accepted.");
  revalidatePath("/budgets");
  return { updated: true };
});

const acceptAction = createSafeAction(acceptBudgetSchema, async (input) => {
  const updated = await db.treatmentBudget.updateMany({ where: { publicToken: input.token, status: "PRESENTED", OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] }, data: { status: "ACCEPTED", acceptedAt: new Date(), acceptedBy: input.acceptedBy } });
  if (!updated.count) throw new Error("This estimate is unavailable, expired, or has already been answered.");
  revalidatePath(`/estimate/${input.token}`);
  revalidatePath("/budgets");
  return { accepted: true };
});

export async function createTreatmentBudget(input: unknown) { return createAction(input); }
export async function updateTreatmentBudgetStatus(input: unknown) { return changeStatusAction(input); }
export async function acceptTreatmentBudget(input: unknown) { return acceptAction(input); }
