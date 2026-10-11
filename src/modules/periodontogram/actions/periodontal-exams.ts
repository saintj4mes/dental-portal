"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { isValidFdiTooth } from "@/modules/odontogram/types";
import { createExamSchema, savePeriodontalChartSchema } from "../schemas/periodontogram";

const createExamAction = createSafeAction(createExamSchema, async (input) => {
  const clinicId = await getClinicId();
  const patient = await db.patient.findFirst({ where: { id: input.patientId, clinicId }, select: { id: true } });
  if (!patient) throw new Error("Patient record was not found in this clinic.");
  const exam = await db.periodontalExam.create({ data: { clinicId, patientId: patient.id, notes: input.notes || null }, select: { id: true } });
  revalidatePath(`/patients/${patient.id}/periodontogram`);
  return exam;
});

const saveChartAction = createSafeAction(savePeriodontalChartSchema, async (input) => {
  const clinicId = await getClinicId();
  const exam = await db.periodontalExam.findFirst({ where: { id: input.examId, clinicId }, select: { id: true, patientId: true } });
  if (!exam) throw new Error("Periodontal exam was not found in this clinic.");
  if (input.measurements.some((item) => !isValidFdiTooth(item.toothNumber))) throw new Error("Chart contains an invalid FDI tooth number.");
  const unique = new Set(input.measurements.map((item) => `${item.toothNumber}:${item.site}`));
  if (unique.size !== input.measurements.length) throw new Error("A tooth site appears more than once in the chart.");
  await db.$transaction([
    db.periodontalExam.update({ where: { id: exam.id }, data: { notes: input.notes || null } }),
    ...input.measurements.map((item) => db.periodontalMeasurement.upsert({
    where: { examId_toothNumber_site: { examId: exam.id, toothNumber: item.toothNumber, site: item.site } },
    create: { examId: exam.id, ...item },
    update: { pocketDepth: item.pocketDepth, recession: item.recession, bleeding: item.bleeding, suppuration: item.suppuration, mobility: item.mobility, furcation: item.furcation },
  }))
  ]);
  revalidatePath(`/patients/${exam.patientId}/periodontogram`);
  return { examId: exam.id, saved: input.measurements.length };
});

export async function createPeriodontalExam(input: unknown) { return createExamAction(input); }
export async function savePeriodontalChart(input: unknown) { return saveChartAction(input); }
