import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { LabOrderWorkspace } from "@/modules/lab-orders/components/LabOrderWorkspace";

export const dynamic = "force-dynamic";

export default async function LabOrdersPage() {
  const clinicId = await getClinicId();
  const [patients, orders] = await Promise.all([
    db.patient.findMany({ where: { clinicId }, select: { id: true, firstName: true, lastName: true }, orderBy: { lastName: "asc" } }),
    db.labOrder.findMany({ where: { clinicId }, include: { patient: { select: { firstName: true, lastName: true } } }, orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }], take: 100 }),
  ]);
  return <LabOrderWorkspace patients={patients.map((patient) => ({ id: patient.id, label: `${patient.lastName}, ${patient.firstName}` }))} orders={orders.map((order) => ({ id: order.id, number: order.orderNumber, patientId: order.patientId, patient: `${order.patient.firstName} ${order.patient.lastName}`, laboratory: order.laboratory, appliance: order.appliance, teeth: order.toothNumbers, shade: order.shade, dueAt: order.dueAt?.toISOString().slice(0, 10) ?? null, cost: order.cost === null ? null : Number(order.cost), instructions: order.instructions, status: order.status, createdAt: order.createdAt.toISOString() }))} />;
}
