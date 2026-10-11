import { z } from "zod";

export const toothSchema = z.object({
  patientId: z.string().uuid(), toothNumber: z.number().int().min(11).max(85),
  overallStatus: z.enum(["HEALTHY", "MISSING", "IMPACTED", "CROWN", "BRIDGE", "IMPLANT", "EXTRACTION_INDICATED", "ENDO_TREATED"]),
  surfaces: z.object({
    mesial: z.enum(["SOUND", "CARIES", "AMALGAM", "COMPOSITE", "SEALANT", "CROWN", "PLANNED"]),
    distal: z.enum(["SOUND", "CARIES", "AMALGAM", "COMPOSITE", "SEALANT", "CROWN", "PLANNED"]),
    occlusal: z.enum(["SOUND", "CARIES", "AMALGAM", "COMPOSITE", "SEALANT", "CROWN", "PLANNED"]),
    buccal: z.enum(["SOUND", "CARIES", "AMALGAM", "COMPOSITE", "SEALANT", "CROWN", "PLANNED"]),
    lingual: z.enum(["SOUND", "CARIES", "AMALGAM", "COMPOSITE", "SEALANT", "CROWN", "PLANNED"]),
  }),
});
