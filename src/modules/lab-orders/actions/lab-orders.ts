"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { createLabOrderSchema, updateLabOrderSchema } from "../schemas/lab-order";

const createAction = createSafeAction(createLabOrderSchema, async (input) => {
  const clinicId = await getClinicId();
  const patient = await db.patient.findFirst({ where: { id: input.patientId, clinicId }, select: { id: true } });
  if (!patient) throw new Error("Patient record was not found.");
  const sequence = await db.clinic.update({ where: { id: clinicId }, data: { currentLabOrderNumber: { increment: 1 } }, select: { currentLabOrderNumber: true } });
  const order = await db.labOrder.create({ data: { clinicId, patientId: patient.id, orderNumber: `LAB-${String(sequence.currentLabOrderNumber).padStart(6, "0")}`, laboratory: input.laboratory, appliance: input.appliance, toothNumbers: [...new Set(input.toothNumbers)], shade: input.shade || null, dueAt: input.dueAt ? new Date(`${input.dueAt}T00:00:00.000Z`) : null, cost: input.cost ?? null, instructions: input.instructions || null, status: "SENT" }, select: { id: true } });
  revalidatePath("/lab-orders");
  return { id: order.id };
});
const updateAction = createSafeAction(updateLabOrderSchema, async (input) => {
  const clinicId = await getClinicId();
  const order = await db.labOrder.findFirst({ where: { id: input.id, clinicId }, select: { id: true, status: true } });
  if (!order) throw new Error("Lab order was not found.");
  const validNext: Record<string, readonly string[]> = { DRAFT: ["SENT", "CANCELLED"], SENT: ["IN_PROGRESS", "READY", "CANCELLED"], IN_PROGRESS: ["READY", "CANCELLED"], READY: ["RECEIVED", "CANCELLED"] };
  if (!validNext[order.status]?.includes(input.status)) throw new Error("This lab order cannot move to that status.");
  await db.labOrder.update({ where: { id: order.id }, data: { status: input.status, receivedAt: input.status === "RECEIVED" ? new Date() : null } });
  revalidatePath("/lab-orders");
  return { updated: true };
});
export async function createLabOrder(input: unknown) { return createAction(input); }
export async function updateLabOrder(input: unknown) { return updateAction(input); }
