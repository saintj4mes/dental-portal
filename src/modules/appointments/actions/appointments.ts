"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { appointmentSchema } from "../schemas/appointment";
import { z } from "zod";
import { chairSchema } from "../schemas/chair";

const createAppointmentAction = createSafeAction(appointmentSchema, async (input) => {
  const clinicId = await getClinicId();
  const startTime = new Date(input.startTime); const endTime = new Date(input.endTime);
  if (endTime <= startTime) throw new Error("Appointment end time must be after the start time.");
  const appointment = await db.$transaction(async (tx) => {
    const [chair, dentist, patient] = await Promise.all([
      tx.dentalChair.findFirst({ where: { id: input.chairId, clinicId, isActive: true } }),
      tx.user.findFirst({ where: { id: input.dentistId, clinicId, role: { in: ["OWNER", "DENTIST"] } } }),
      tx.patient.findFirst({ where: { id: input.patientId, clinicId } }),
    ]);
    if (!chair || !dentist || !patient) throw new Error("Select a patient, dentist, and operatory from this clinic.");
    const overlapping = await tx.appointment.findFirst({ where: {
      clinicId, status: { notIn: ["CANCELLED", "NO_SHOW"] }, startTime: { lt: endTime }, endTime: { gt: startTime },
      OR: [{ chairId: input.chairId }, { dentistId: input.dentistId }],
    } });
    if (overlapping) throw new Error("This dentist or operatory already has an appointment during that time.");
    return tx.appointment.create({ data: { ...input, clinicId, startTime, endTime, reason: input.reason || null } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  revalidatePath("/calendar"); revalidatePath("/dashboard"); revalidatePath("/patients");
  return { id: appointment.id };
});

export async function createAppointment(input: unknown) {
  return createAppointmentAction(input);
}

const statusAction = createSafeAction(z.object({ id: z.string().uuid(), status: z.enum(["CONFIRMED", "IN_CHAIR", "COMPLETED", "CANCELLED", "NO_SHOW"]) }), async ({ id, status }) => {
  const clinicId = await getClinicId();
  const appointment = await db.appointment.updateMany({ where: { id, clinicId }, data: { status } });
  if (appointment.count === 0) throw new Error("Appointment was not found.");
  revalidatePath("/calendar");
  return { id };
});
export async function updateAppointmentStatus(input: unknown) { return statusAction(input); }

const saveChairAction = createSafeAction(chairSchema, async ({ name, isActive }) => {
  const clinicId = await getClinicId();
  const chair = await db.dentalChair.upsert({ where: { clinicId_name: { clinicId, name } }, create: { clinicId, name, isActive }, update: { isActive } });
  revalidatePath("/settings"); revalidatePath("/calendar");
  return { id: chair.id };
});
export async function saveChair(input: unknown) { return saveChairAction(input); }
