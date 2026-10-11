"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { workspaceModules } from "@/shared/lib/workspace-modules";
import { workspaceRecordSchema, workspaceStatusSchema } from "../schemas/record";

const createRecordAction = createSafeAction(workspaceRecordSchema, async (input) => {
  const config = workspaceModules[input.module];
  if (!config.statuses.some((status) => status === input.status)) throw new Error("Choose a valid status for this record.");
  const clinicId = await getClinicId();
  const record = await db.workspaceRecord.create({ data: {
    clinicId,
    module: input.module,
    title: input.title,
    details: input.details || null,
    reference: input.reference || null,
    status: input.status,
    amount: input.amount === undefined ? null : input.amount,
    dueAt: input.dueAt ? new Date(`${input.dueAt}T00:00:00.000Z`) : null,
  } });
  revalidatePath(`/${input.module}`);
  return { id: record.id };
});

const changeStatusAction = createSafeAction(workspaceStatusSchema, async (input) => {
  const config = workspaceModules[input.module];
  if (!config.statuses.some((status) => status === input.status)) throw new Error("Choose a valid status for this record.");
  await db.workspaceRecord.updateMany({
    where: { id: input.id, clinicId: await getClinicId(), module: input.module },
    data: { status: input.status },
  });
  revalidatePath(`/${input.module}`);
  return { id: input.id };
});

export async function createWorkspaceRecord(input: unknown) {
  return createRecordAction(input);
}

export async function updateWorkspaceRecordStatus(input: unknown) {
  return changeStatusAction(input);
}
