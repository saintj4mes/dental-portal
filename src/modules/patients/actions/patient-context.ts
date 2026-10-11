"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { communicationSchema, contextRecordIdSchema, relationshipSchema } from "../schemas/patient-context";

const createRelationshipAction = createSafeAction(relationshipSchema, async (input) => {
  const clinicId = await getClinicId();
  const patient = await db.patient.findFirst({ where: { id: input.patientId, clinicId }, select: { id: true } });
  if (!patient) throw new Error("Patient record was not found in this clinic.");
  const relationship = await db.patientRelationship.create({ data: {
    clinicId, patientId: patient.id, name: input.name, relationship: input.relationship,
    mobileNumber: input.mobileNumber || null, email: input.email || null,
    isEmergencyContact: input.isEmergencyContact, isGuardian: input.isGuardian, notes: input.notes || null,
  }, select: { id: true } });
  revalidatePath(`/patients/${patient.id}`);
  return relationship;
});

const deleteRelationshipAction = createSafeAction(contextRecordIdSchema, async ({ id }) => {
  const clinicId = await getClinicId();
  const row = await db.patientRelationship.findFirst({ where: { id, clinicId }, select: { id: true, patientId: true } });
  if (!row) throw new Error("Patient contact was not found in this clinic.");
  await db.patientRelationship.delete({ where: { id } });
  revalidatePath(`/patients/${row.patientId}`);
  return { id };
});

const createCommunicationAction = createSafeAction(communicationSchema, async (input) => {
  const clinicId = await getClinicId();
  const patient = await db.patient.findFirst({ where: { id: input.patientId, clinicId }, select: { id: true } });
  if (!patient) throw new Error("Patient record was not found in this clinic.");
  const log = await db.patientCommunication.create({ data: {
    clinicId, patientId: patient.id, channel: input.channel, direction: input.direction,
    subject: input.subject, summary: input.summary || null, outcome: input.outcome || null,
    followUpAt: input.followUpAt ? new Date(input.followUpAt) : null,
  }, select: { id: true } });
  revalidatePath(`/patients/${patient.id}`);
  return log;
});

export async function createPatientRelationship(input: unknown) { return createRelationshipAction(input); }
export async function deletePatientRelationship(input: unknown) { return deleteRelationshipAction(input); }
export async function createPatientCommunication(input: unknown) { return createCommunicationAction(input); }
