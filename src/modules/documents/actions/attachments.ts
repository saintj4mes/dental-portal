"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { createPatientFileUrl, deleteStoredFile, putPatientFile } from "../services/s3-storage";
import { attachmentLinkSchema, isAcceptedAttachmentMimeType, uploadAttachmentSchema } from "../schemas/attachment";

const fileExtensions: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "application/pdf": "pdf", "application/dicom": "dcm",
};

const uploadAction = createSafeAction(uploadAttachmentSchema, async (input) => {
  const clinicId = await getClinicId();
  const patient = await db.patient.findFirst({ where: { id: input.patientId, clinicId }, select: { id: true } });
  if (!patient) throw new Error("Patient record was not found in this clinic.");
  if (!isAcceptedAttachmentMimeType(input.file.type)) throw new Error("This file type is not supported.");
  const key = `clinics/${clinicId}/patients/${patient.id}/${randomUUID()}.${fileExtensions[input.file.type]}`;
  await putPatientFile({ key, mimeType: input.file.type, body: new Uint8Array(await input.file.arrayBuffer()) });
  try {
    const attachment = await db.patientAttachment.create({ data: {
      clinicId,
      patientId: patient.id,
      category: input.category,
      fileName: input.file.name.replace(/[\r\n]/g, "_").slice(0, 255),
      mimeType: input.file.type,
      byteSize: input.file.size,
      objectKey: key,
      caption: input.caption || null,
    }, select: { id: true, fileName: true } });
    revalidatePath(`/patients/${patient.id}`);
    return attachment;
  } catch (error: unknown) {
    try { await deleteStoredFile(key); } catch { /* Preserve the database failure; the object can be reconciled later. */ }
    throw error;
  }
});

const linkAction = createSafeAction(attachmentLinkSchema, async ({ id }) => {
  const attachment = await db.patientAttachment.findFirst({ where: { id, clinicId: await getClinicId() } });
  if (!attachment) throw new Error("File was not found in this clinic.");
  return { url: await createPatientFileUrl({ key: attachment.objectKey, fileName: attachment.fileName, mimeType: attachment.mimeType }) };
});

const deleteAction = createSafeAction(attachmentLinkSchema, async ({ id }) => {
  const attachment = await db.patientAttachment.findFirst({ where: { id, clinicId: await getClinicId() } });
  if (!attachment) throw new Error("File was not found in this clinic.");
  await deleteStoredFile(attachment.objectKey);
  await db.patientAttachment.delete({ where: { id: attachment.id } });
  revalidatePath(`/patients/${attachment.patientId}`);
  return { id };
});

export async function uploadPatientAttachment(input: unknown) { return uploadAction(input); }
export async function getPatientAttachmentUrl(input: unknown) { return linkAction(input); }
export async function deletePatientAttachment(input: unknown) { return deleteAction(input); }
