"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { z } from "zod";

const treatmentSchema = z.object({ category: z.string().trim().min(1).max(80), name: z.string().trim().min(1).max(180), defaultPrice: z.number().min(0), description: z.string().trim().max(2000).optional() });
const saveTreatmentAction = createSafeAction(treatmentSchema, async (input) => {
  const treatment = await db.treatment.create({ data: { ...input, clinicId: await getClinicId(), description: input.description || null } });
  revalidatePath("/settings");
  return { id: treatment.id };
});
export async function saveTreatment(input: unknown) { return saveTreatmentAction(input); }
