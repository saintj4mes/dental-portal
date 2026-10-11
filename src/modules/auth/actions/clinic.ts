"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { clinicSchema } from "../schemas/clinic";

const updateClinicAction = createSafeAction(clinicSchema, async (input) => {
  const clinic = await db.clinic.update({ where: { id: await getClinicId() }, data: { name: input.name, taxId: input.taxId || null, address: input.address || null, contactNumber: input.contactNumber || null, officialReceiptPrefix: input.officialReceiptPrefix, isVatRegistered: input.isVatRegistered } });
  revalidatePath("/settings"); revalidatePath("/calendar");
  return { id: clinic.id };
});
export async function updateClinic(input: unknown) { return updateClinicAction(input); }
