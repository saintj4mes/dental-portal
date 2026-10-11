import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { BudgetWorkspace } from "@/modules/budgets/components/BudgetWorkspace";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const clinicId = await getClinicId();
  const [patients, records] = await Promise.all([
    db.patient.findMany({ where: { clinicId }, select: { id: true, firstName: true, lastName: true }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
    db.treatmentBudget.findMany({ where: { clinicId }, include: { patient: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return <BudgetWorkspace patients={patients.map((patient) => ({ id: patient.id, label: `${patient.lastName}, ${patient.firstName}` }))} budgets={records.map((budget) => ({ id: budget.id, number: budget.budgetNumber, title: budget.title, patient: `${budget.patient.firstName} ${budget.patient.lastName}`, status: budget.status, total: Number(budget.total), createdAt: budget.createdAt.toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" }), validUntil: budget.validUntil?.toISOString().slice(0, 10) ?? null, sharePath: `/estimate/${budget.publicToken}` }))} />;
}
