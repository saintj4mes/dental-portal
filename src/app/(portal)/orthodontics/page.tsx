import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { OrthodonticsWorkspace } from "@/modules/orthodontics/components/OrthodonticsWorkspace";

export const dynamic = "force-dynamic";

export default async function OrthodonticsPage() {
  const clinicId = await getClinicId();
  const [patients, cases] = await Promise.all([
    db.patient.findMany({ where: { clinicId }, select: { id: true, firstName: true, lastName: true }, orderBy: { lastName: "asc" } }),
    db.orthodonticCase.findMany({ where: { clinicId }, include: { patient: { select: { firstName: true, lastName: true } }, visits: { orderBy: { visitedAt: "desc" }, take: 12 } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return <OrthodonticsWorkspace patients={patients.map((patient) => ({ id: patient.id, name: `${patient.firstName} ${patient.lastName}` }))} cases={cases.map((record) => ({ id: record.id, patientId: record.patientId, patient: `${record.patient.firstName} ${record.patient.lastName}`, title: record.title, appliance: record.appliance, status: record.status, startedAt: record.startedAt?.toISOString().slice(0, 10) ?? null, targetEndAt: record.targetEndAt?.toISOString().slice(0, 10) ?? null, notes: record.notes, visits: record.visits.map((visit) => ({ id: visit.id, visitedAt: visit.visitedAt.toISOString().slice(0, 10), procedure: visit.procedure, notes: visit.notes, nextVisitAt: visit.nextVisitAt?.toISOString().slice(0, 10) ?? null })) }))} />;
}
