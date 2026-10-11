import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { PayrollWorkspace } from "@/modules/payroll/components/PayrollWorkspace";

export const dynamic = "force-dynamic";

export default async function PayrollPage() {
  const periods = await db.payrollPeriod.findMany({ where: { clinicId: await getClinicId() }, include: { entries: { orderBy: { staffName: "asc" } } }, orderBy: { periodStart: "desc" }, take: 50 });
  return <PayrollWorkspace periods={periods.map((period) => ({ id: period.id, name: period.name, start: period.periodStart.toISOString().slice(0, 10), end: period.periodEnd.toISOString().slice(0, 10), payDate: period.payDate?.toISOString().slice(0, 10) ?? null, status: period.status, entries: period.entries.map((entry) => ({ ...entry, daysWorked: Number(entry.daysWorked), dailyRate: Number(entry.dailyRate), overtimeHours: Number(entry.overtimeHours), overtimeRate: Number(entry.overtimeRate), commission: Number(entry.commission), allowances: Number(entry.allowances), sssContribution: Number(entry.sssContribution), philhealthContribution: Number(entry.philhealthContribution), pagibigContribution: Number(entry.pagibigContribution), withholdingTax: Number(entry.withholdingTax), deductions: Number(entry.deductions), grossPay: Number(entry.grossPay), netPay: Number(entry.netPay) })) }))} />;
}
