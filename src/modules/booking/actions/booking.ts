"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { approveBookingSchema, declineBookingSchema, publicBookingSchema } from "../schemas/booking";

const publicRequestAction = createSafeAction(publicBookingSchema, async (input) => {
  const clinic = await db.clinic.findUnique({ where: { id: input.clinicId }, select: { id: true } });
  if (!clinic) throw new Error("Clinic booking link is unavailable.");
  const requestedAt = new Date(`${input.requestedAt}:00+08:00`);
  const now = new Date();
  if (!Number.isFinite(requestedAt.getTime()) || requestedAt <= now || requestedAt.getTime() > now.getTime() + 90 * 24 * 60 * 60 * 1000) throw new Error("Choose a date and time within the next 90 days.");
  await db.publicBookingRequest.create({ data: { clinicId: clinic.id, patientName: input.patientName, mobileNumber: normalizeMobile(input.mobileNumber), email: input.email || null, requestedAt, reason: input.reason || null } });
  return { received: true };
});

const approveAction = createSafeAction(approveBookingSchema, async (input) => {
  const clinicId = await getClinicId();
  const request = await db.publicBookingRequest.findFirst({ where: { id: input.requestId, clinicId, status: "PENDING" } });
  if (!request) throw new Error("Pending booking request was not found.");
  const [dentist, chair] = await Promise.all([db.user.findFirst({ where: { id: input.dentistId, clinicId, role: "DENTIST" }, select: { id: true } }), db.dentalChair.findFirst({ where: { id: input.chairId, clinicId, isActive: true }, select: { id: true } })]);
  if (!dentist || !chair) throw new Error("Select a dentist and operatory from this clinic.");
  const startTime = request.requestedAt;
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
  if (startTime <= new Date()) throw new Error("This requested slot is in the past; contact the patient to choose a new time.");
  await db.$transaction(async (tx) => {
    const conflict = await tx.appointment.findFirst({ where: { clinicId, status: { notIn: ["CANCELLED", "NO_SHOW"] }, startTime: { lt: endTime }, endTime: { gt: startTime }, OR: [{ chairId: chair.id }, { dentistId: dentist.id }] }, select: { id: true } });
    if (conflict) throw new Error("The selected dentist or operatory is already booked at that time.");
    const names = request.patientName.trim().split(/\s+/);
    const mobile = normalizeMobile(request.mobileNumber);
    let patient = await tx.patient.findFirst({ where: { clinicId, mobileNumber: mobile }, select: { id: true } });
    if (!patient) patient = await tx.patient.create({ data: { clinicId, firstName: names[0] ?? request.patientName, lastName: names.slice(1).join(" ") || "Patient", mobileNumber: mobile, email: request.email }, select: { id: true } });
    await tx.appointment.create({ data: { clinicId, patientId: patient.id, dentistId: dentist.id, chairId: chair.id, startTime, endTime, status: "CONFIRMED", reason: request.reason || "Online booking request" } });
    await tx.publicBookingRequest.update({ where: { id: request.id }, data: { status: "BOOKED", patientId: patient.id } });
  });
  revalidatePath("/booking-requests"); revalidatePath("/calendar"); revalidatePath("/patients");
  return { booked: true };
});

const declineAction = createSafeAction(declineBookingSchema, async (input) => {
  const updated = await db.publicBookingRequest.updateMany({ where: { id: input.requestId, clinicId: await getClinicId(), status: "PENDING" }, data: { status: "DECLINED" } });
  if (!updated.count) throw new Error("Pending booking request was not found.");
  revalidatePath("/booking-requests");
  return { declined: true };
});
export async function requestPublicBooking(input: unknown) { return publicRequestAction(input); }
export async function approvePublicBooking(input: unknown) { return approveAction(input); }
export async function declinePublicBooking(input: unknown) { return declineAction(input); }
function normalizeMobile(number: string) { return number.startsWith("+63") ? `0${number.slice(3)}` : number.startsWith("63") ? `0${number.slice(2)}` : number; }
