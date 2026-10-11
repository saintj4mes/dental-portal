"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { createPrescriptionSchema, prescriptionStatusSchema } from "../schemas/prescription";

const createAction = createSafeAction(createPrescriptionSchema, async (input) => {
  const clinicId = await getClinicId();
  const [patient, dentist] = await Promise.all([
    db.patient.findFirst({ where: { id: input.patientId, clinicId }, select: { id: true } }),
    db.user.findFirst({ where: { id: input.dentistId, clinicId, role: { in: ["OWNER", "DENTIST"] } }, select: { id: true } }),
  ]);
  if (!patient || !dentist) throw new Error("Select a patient and licensed dentist from this clinic.");
  const record = await db.$transaction(async (tx) => {
    const sequence = await tx.clinic.update({ where: { id: clinicId }, data: { currentPrescriptionNumber: { increment: 1 } }, select: { currentPrescriptionNumber: true } });
    return tx.prescription.create({ data: { clinicId, patientId: patient.id, dentistId: dentist.id, prescriptionNumber: `RX-${String(sequence.currentPrescriptionNumber).padStart(6, "0")}`, validUntil: input.validUntil ? new Date(`${input.validUntil}T00:00:00.000Z`) : null, diagnosis: input.diagnosis || null, notes: input.notes || null, items: { create: input.items } }, select: { id: true } });
  });
  revalidatePath("/prescriptions"); revalidatePath(`/patients/${patient.id}`);
  return { id: record.id };
});
const statusAction = createSafeAction(prescriptionStatusSchema, async (input) => {
  const result = await db.prescription.updateMany({ where: { id: input.id, clinicId: await getClinicId(), status: "ISSUED" }, data: { status: input.status } });
  if (!result.count) throw new Error("Active prescription was not found.");
  revalidatePath("/prescriptions");
  return { updated: true };
});
export async function createPrescription(input: unknown) { return createAction(input); }
export async function updatePrescriptionStatus(input: unknown) { return statusAction(input); }
