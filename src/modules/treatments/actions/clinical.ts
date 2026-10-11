"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { clinicalNoteSchema, treatmentPlanSchema } from "../schemas/clinical-note";
import { isValidFdiTooth } from "@/modules/odontogram/types";
import { getSession, isAuthenticationConfigured } from "@/modules/auth/lib/session";

async function currentDentistId(clinicId: string): Promise<string> {
  const session = await getSession();
  if (session && session.role !== "OWNER" && session.role !== "DENTIST") throw new Error("Only clinic owners and dentists can write clinical records.");
  const email = session?.email ?? process.env.AUTH_EMAIL;
  const user = email ? await db.user.findFirst({ where: { clinicId, email, role: { in: ["OWNER", "DENTIST"] } }, select: { id: true } }) : null;
  if (user) return user.id;
  if (!isAuthenticationConfigured() && process.env.DEMO_DENTIST_ID) {
    const demoUser = await db.user.findFirst({ where: { id: process.env.DEMO_DENTIST_ID, clinicId, role: { in: ["OWNER", "DENTIST"] } }, select: { id: true } });
    if (demoUser) return demoUser.id;
  }
  throw new Error("No signed-in dentist profile is configured for clinical recordkeeping.");
}

const createClinicalNoteAction = createSafeAction(clinicalNoteSchema, async (input) => {
  const clinicId = await getClinicId();
  const dentistId = await currentDentistId(clinicId);
  const patient = await db.patient.findFirst({ where: { id: input.patientId, clinicId }, select: { id: true } });
  if (!patient) throw new Error("Patient record was not found in this clinic.");
  if (input.appointmentId) {
    const appointment = await db.appointment.findFirst({ where: { id: input.appointmentId, clinicId, patientId: patient.id }, select: { id: true } });
    if (!appointment) throw new Error("Appointment does not belong to this patient and clinic.");
  }
  if ((input.toothNumbers ?? []).some((number) => !isValidFdiTooth(number))) throw new Error("Clinical note contains an invalid FDI tooth number.");
  const note = await db.clinicalNote.create({ data: { ...input, dentistId, appointmentId: input.appointmentId || null } });
  revalidatePath(`/patients/${patient.id}`);
  return { id: note.id };
});
export async function createClinicalNote(input: unknown) { return createClinicalNoteAction(input); }

const createTreatmentPlanAction = createSafeAction(treatmentPlanSchema, async (input) => {
  const clinicId = await getClinicId();
  const dentistId = await currentDentistId(clinicId);
  const patient = await db.patient.findFirst({ where: { id: input.patientId, clinicId }, select: { id: true } });
  if (!patient) throw new Error("Patient record was not found in this clinic.");
  const treatmentIds = input.items.flatMap((item) => item.treatmentId ? [item.treatmentId] : []);
  if (treatmentIds.length) {
    const clinicTreatments = await db.treatment.findMany({ where: { id: { in: treatmentIds }, clinicId }, select: { id: true } });
    if (clinicTreatments.length !== new Set(treatmentIds).size) throw new Error("A selected treatment does not belong to this clinic.");
  }
  for (const item of input.items) if ((item.toothNumbers ?? []).some((number) => !isValidFdiTooth(number))) throw new Error("Treatment plan contains an invalid FDI tooth number.");
  const plan = await db.treatmentPlan.create({ data: {
    clinicId, patientId: patient.id, dentistId, title: input.title, status: input.status,
    items: { create: input.items.map((item) => ({ treatmentId: item.treatmentId || null, name: item.name, toothNumbers: item.toothNumbers ?? [], quantity: item.quantity, unitPrice: item.unitPrice })) },
  } });
  revalidatePath(`/patients/${patient.id}`);
  return { id: plan.id };
});
export async function createTreatmentPlan(input: unknown) { return createTreatmentPlanAction(input); }
