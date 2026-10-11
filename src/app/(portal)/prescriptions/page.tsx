import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { PrescriptionWorkspace } from "@/modules/prescriptions/components/PrescriptionWorkspace";

export const dynamic = "force-dynamic";

export default async function PrescriptionsPage() {
  const clinicId = await getClinicId();
  const [patients, dentists, records] = await Promise.all([
    db.patient.findMany({ where: { clinicId }, select: { id: true, firstName: true, lastName: true }, orderBy: { lastName: "asc" } }),
    db.user.findMany({ where: { clinicId, role: { in: ["OWNER", "DENTIST"] } }, select: { id: true, name: true, prcLicenseNumber: true, ptrNumber: true }, orderBy: { name: "asc" } }),
    db.prescription.findMany({ where: { clinicId }, include: { patient: { select: { firstName: true, lastName: true } }, dentist: { select: { name: true, prcLicenseNumber: true, ptrNumber: true } }, items: true }, orderBy: { issuedAt: "desc" }, take: 100 }),
  ]);
  return <PrescriptionWorkspace patients={patients.map((patient) => ({ id: patient.id, label: `${patient.lastName}, ${patient.firstName}` }))} dentists={dentists.map((dentist) => ({ id: dentist.id, label: `${dentist.name}${dentist.prcLicenseNumber ? ` · PRC ${dentist.prcLicenseNumber}` : ""}` }))} prescriptions={records.map((record) => ({ id: record.id, number: record.prescriptionNumber, date: record.issuedAt.toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" }), validUntil: record.validUntil?.toISOString().slice(0, 10) ?? null, diagnosis: record.diagnosis, notes: record.notes, status: record.status, patient: `${record.patient.firstName} ${record.patient.lastName}`, dentist: record.dentist.name, dentistLicense: record.dentist.prcLicenseNumber, dentistPtr: record.dentist.ptrNumber, items: record.items }))} />;
}
