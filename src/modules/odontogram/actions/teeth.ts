"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { createSafeAction } from "@/shared/lib/action-client";
import { isValidFdiTooth } from "../types";
import { toothSchema } from "../schemas/tooth";
import { getClinicId } from "@/shared/lib/clinic-context";

const saveToothAction = createSafeAction(toothSchema, async (input) => {
  if (!isValidFdiTooth(input.toothNumber)) throw new Error("Invalid FDI tooth number.");
  const patient = await db.patient.findFirst({ where: { id: input.patientId, clinicId: await getClinicId() }, select: { id: true } });
  if (!patient) throw new Error("Patient record was not found.");
  const record = await db.$transaction(async (tx) => tx.toothRecord.upsert({
    where: { patientId_toothNumber: { patientId: input.patientId, toothNumber: input.toothNumber } },
    create: { patientId: input.patientId, toothNumber: input.toothNumber, overallStatus: input.overallStatus, surfaces: input.surfaces },
    update: { overallStatus: input.overallStatus, surfaces: input.surfaces },
  }));
  revalidatePath(`/patients/${input.patientId}`);
  return { id: record.id, toothNumber: record.toothNumber };
});

export async function saveToothState(input: unknown) {
  return saveToothAction(input);
}

