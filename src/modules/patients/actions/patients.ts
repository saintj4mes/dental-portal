"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { normalizePhMobile } from "@/shared/lib/formatters";
import { createSafeAction } from "@/shared/lib/action-client";
import { patientSchema } from "../schemas/patient";

const createPatientAction = createSafeAction(patientSchema, async (input) => {
  const patient = await db.patient.create({ data: {
    clinicId: await getClinicId(), firstName: input.firstName, lastName: input.lastName,
    birthDate: input.birthDate ? new Date(`${input.birthDate}T00:00:00.000Z`) : null,
    gender: input.gender ?? null, mobileNumber: normalizePhMobile(input.mobileNumber),
    email: input.email || null, medicalAlerts: input.medicalAlerts, allergies: input.allergies, seniorPwdId: input.seniorPwdId || null,
  } });
  revalidatePath("/patients");
  return { id: patient.id, name: `${patient.firstName} ${patient.lastName}` };
});

export async function createPatient(input: unknown) {
  return createPatientAction(input);
}
