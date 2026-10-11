"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { createOrthoCaseSchema, createOrthoVisitSchema, updateOrthoStatusSchema } from "../schemas/orthodontics";

const createCaseAction = createSafeAction(createOrthoCaseSchema, async (input) => {
  const clinicId = await getClinicId();
  const patient = await db.patient.findFirst({ where: { id: input.patientId, clinicId }, select: { id: true } });
  if (!patient) throw new Error("Patient record was not found.");
  const record = await db.orthodonticCase.create({ data: { clinicId, patientId: patient.id, title: input.title, appliance: input.appliance, startedAt: input.startedAt ? new Date(`${input.startedAt}T00:00:00.000Z`) : null, targetEndAt: input.targetEndAt ? new Date(`${input.targetEndAt}T00:00:00.000Z`) : null, notes: input.notes || null } });
  revalidatePath("/orthodontics");
  return { id: record.id };
});
const addVisitAction = createSafeAction(createOrthoVisitSchema, async (input) => {
  const clinicId = await getClinicId();
  const orthoCase = await db.orthodonticCase.findFirst({ where: { id: input.caseId, clinicId }, select: { id: true } });
  if (!orthoCase) throw new Error("Orthodontic case was not found.");
  await db.orthodonticVisit.create({ data: { caseId: orthoCase.id, visitedAt: new Date(`${input.visitedAt}T00:00:00.000Z`), procedure: input.procedure, notes: input.notes || null, nextVisitAt: input.nextVisitAt ? new Date(`${input.nextVisitAt}T00:00:00.000Z`) : null } });
  revalidatePath("/orthodontics");
  return { saved: true };
});
const statusAction = createSafeAction(updateOrthoStatusSchema, async (input) => {
  const result = await db.orthodonticCase.updateMany({ where: { id: input.caseId, clinicId: await getClinicId() }, data: { status: input.status } });
  if (!result.count) throw new Error("Orthodontic case was not found.");
  revalidatePath("/orthodontics");
  return { updated: true };
});
export async function createOrthodonticCase(input: unknown) { return createCaseAction(input); }
export async function addOrthodonticVisit(input: unknown) { return addVisitAction(input); }
export async function updateOrthodonticCaseStatus(input: unknown) { return statusAction(input); }
