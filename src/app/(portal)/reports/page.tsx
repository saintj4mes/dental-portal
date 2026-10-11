import Link from "next/link";
import { ArrowRight, CalendarDays, FileBarChart, PhilippinePeso, UsersRound } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { formatPHP } from "@/shared/lib/formatters";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const clinicId = await getClinicId();
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const [patients, appointmentCount, completedAppointments, invoiceTotals, recentInvoices, upcomingAppointments] = await Promise.all([
    db.patient.count({ where: { clinicId } }),
    db.appointment.count({ where: { clinicId, startTime: { gte: monthStart, lt: nextMonth } } }),
    db.appointment.count({ where: { clinicId, status: "COMPLETED", startTime: { gte: monthStart, lt: nextMonth } } }),
    db.invoice.aggregate({ where: { clinicId, createdAt: { gte: monthStart, lt: nextMonth } }, _sum: { patientDueAmount: true }, _count: true }),
    db.invoice.findMany({ where: { clinicId, createdAt: { gte: monthStart, lt: nextMonth } }, orderBy: { createdAt: "asc" }, select: { createdAt: true, patientDueAmount: true } }),
    db.appointment.findMany({ where: { clinicId, startTime: { gte: now }, status: { in: ["SCHEDULED", "CONFIRMED"] } }, orderBy: { startTime: "asc" }, take: 6, include: { patient: true, chair: true } }),
  ]);
  const revenue = Number(invoiceTotals._sum.patientDueAmount ?? 0);
  const bins = Array.from({ length: 7 }, (_, index) => ({ label: `W${index + 1}`, amount: 0 }));
  for (const invoice of recentInvoices) bins[Math.min(6, Math.floor((invoice.createdAt.getUTCDate() - 1) / 5))]!.amount += Number(invoice.patientDueAmount);
  const maxRevenue = Math.max(1, ...bins.map((bin) => bin.amount));
  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs text-[#94908a]">Clinic / Insights</p><h1 className="text-[24px] font-semibold tracking-tight text-slate-900">Reports</h1><p className="mt-1 text-[13px] text-[#615d59]">A live view of patient activity, scheduling, and clinic collections.</p></div><span className="rounded-md bg-sky-50 px-3 py-2 text-xs font-medium text-sky-800">{new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric", timeZone: "Asia/Manila" }).format(now)}</span></header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><ReportMetric title="Active patient records" value={patients.toLocaleString("en-PH")} icon={<UsersRound size={17} />} /><ReportMetric title="Appointments this month" value={appointmentCount.toLocaleString("en-PH")} icon={<CalendarDays size={17} />} /><ReportMetric title="Completed visits" value={completedAppointments.toLocaleString("en-PH")} icon={<FileBarChart size={17} />} /><ReportMetric title="Invoiced this month" value={formatPHP(revenue)} icon={<PhilippinePeso size={17} />} /></div>
    <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
      <Card className="p-5"><div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold text-slate-900">Collections by week</h2><p className="mt-1 text-xs text-[#94908a]">Invoice patient due totals created this month</p></div><span className="text-sm font-semibold tabular-nums text-slate-900">{formatPHP(revenue)}</span></div><div className="mt-7 flex h-44 items-end gap-3 border-b border-[var(--color-border-subtle)] pb-2">{bins.map((bin) => <div key={bin.label} className="flex h-full flex-1 flex-col justify-end gap-2"><div title={formatPHP(bin.amount)} className="w-full rounded-t-sm bg-sky-500/80 hover:bg-sky-600" style={{ height: `${Math.max(3, (bin.amount / maxRevenue) * 100)}%` }} /><span className="text-center text-[10px] text-[#94908a]">{bin.label}</span></div>)}</div><p className="mt-3 text-[11px] text-[#94908a]">Amounts reflect billed patient responsibility; HMO reimbursements are tracked separately.</p></Card>
      <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-4"><div><h2 className="text-sm font-semibold text-slate-900">Upcoming schedule</h2><p className="mt-1 text-xs text-[#94908a]">Next appointments</p></div><Link href="/calendar" className="flex items-center gap-1 text-xs font-medium text-sky-700">Open agenda <ArrowRight size={13} /></Link></div><div className="divide-y divide-black/[0.05]">{upcomingAppointments.length ? upcomingAppointments.map((appointment) => <div key={appointment.id} className="flex items-center gap-3 px-5 py-3"><div className="w-14 shrink-0 text-[11px] font-medium tabular-nums text-[#615d59]">{new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }).format(appointment.startTime)}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-slate-900">{appointment.patient.firstName} {appointment.patient.lastName}</p><p className="mt-0.5 truncate text-[10px] text-[#94908a]">{appointment.reason || "Appointment"} · {appointment.chair.name}</p></div><span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] text-sky-800">{appointment.status.replaceAll("_", " ")}</span></div>) : <p className="px-5 py-10 text-center text-xs text-[#94908a]">No upcoming appointments are scheduled.</p>}</div></Card>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ href: "/billing", title: "Billing report", copy: `${invoiceTotals._count} invoices issued this month` }, { href: "/budgets", title: "Treatment budgets", copy: "Review patient estimates and approvals" }, { href: "/calendar", title: "Scheduling report", copy: `${completedAppointments} completed visits this month` }, { href: "/payments", title: "Payment report", copy: "Review collections and payment methods" }].map((item) => <Link key={item.href + item.title} href={item.href} className="rounded-lg border border-[var(--color-border)] bg-white p-4 transition hover:border-sky-300 hover:bg-sky-50/30"><span className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-900">{item.title}</span><ArrowRight size={14} className="text-[#94908a]" /></span><span className="mt-2 block text-[11px] text-[#94908a]">{item.copy}</span></Link>)}</div>
  </div>;
}

function ReportMetric({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return <Card className="p-4"><span className="grid h-8 w-8 place-items-center rounded-md bg-sky-50 text-sky-700">{icon}</span><p className="mt-4 text-[23px] font-semibold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-[#615d59]">{title}</p></Card>;
}
