import { z } from "zod";

export const attachmentCategorySchema = z.enum(["CLINICAL_PHOTO", "RADIOGRAPH", "DOCUMENT"]);
export const attachmentLinkSchema = z.object({ id: z.string().uuid() });

const acceptedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf", "application/dicom"]);

export const uploadAttachmentSchema = z.object({
  patientId: z.string().uuid(),
  category: attachmentCategorySchema,
  caption: z.string().trim().max(500).optional().default(""),
  file: z.custom<File>((value): value is File => typeof File !== "undefined" && value instanceof File, "Choose a file.")
    .refine((file) => file.size > 0 && file.size <= 18 * 1024 * 1024, "File size must be between 1 byte and 18 MB.")
    .refine((file) => acceptedMimeTypes.has(file.type), "Upload a JPEG, PNG, WebP, PDF, or DICOM file."),
});

export function isAcceptedAttachmentMimeType(value: string): boolean {
  return acceptedMimeTypes.has(value);
}
