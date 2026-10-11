import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, MoreHorizontal, Sparkles, UsersRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { AddPatientDialog } from "@/modules/patients/components/AddPatientDialog";
import { formatPHP } from "@/shared/lib/formatters";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { addDays, startOfDay } from "@/shared/lib/dates";

const todayAppointments = [
  { time: "09:00 AM", name: "Sofia Reyes", treatment: "Cleaning & polishing", chair: "Operatory 1", color: "sky", status: "Checked in" },
  { time: "10:30 AM", name: "Miguel Santos", treatment: "Consultation", chair: "Operatory 2", color: "blue", status: "Confirmed" },
  { time: "11:15 AM", name: "Isabella Lim", treatment: "Tooth restoration · #26", chair: "Operatory 1", color: "amber", status: "Confirmed" },
  { time: "01:00 PM", name: "Gabriel Tan", treatment: "Root canal treatment", chair: "Surgical suite", color: "violet", status: "Confirmed" },
];

const bars = [42, 61, 50, 72, 56, 84, 68, 75, 59, 91, 72, 85];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let appointments = todayAppointments;
  let recentPatients = [
    { id: "00000000-0000-4000-8000-000000000101", initials: "SR", name: "Sofia Reyes", detail: "Cleaning · today, 9:00 AM", bg: "#dff1ed", color: "#26796f" },
    { id: "00000000-0000-4000-8000-000000000102", initials: "MS", name: "Miguel Santos", detail: "Consultation · today, 10:30 AM", bg: "#e7eefb", color: "#496997" },
    { id: "00000000-0000-4000-8000-000000000103", initials: "IL", name: "Isabella Lim", detail: "Restoration · Oct 7, 2026", bg: "#f8eee1", color: "#9c6b36" },
  ];
  let patientCount = 1284;
  let planCount = 28;
  try {
    const clinicId = await getClinicId();
    const today = startOfDay(new Date());
    const [appointmentsToday, patientRows, patientsTotal, plansTotal] = await Promise.all([
      db.appointment.findMany({ where: { clinicId, startTime: { gte: today, lt: addDays(today, 1) }, status: { notIn: ["CANCELLED", "NO_SHOW"] } }, include: { patient: { select: { firstName: true, lastName: true } }, chair: { select: { name: true } } }, orderBy: { startTime: "asc" } }),
      db.patient.findMany({ where: { clinicId }, include: { appointments: { where: { startTime: { gte: today, lt: addDays(today, 1) }, status: { notIn: ["CANCELLED", "NO_SHOW"] } }, orderBy: { startTime: "asc" }, take: 1 } }, orderBy: { createdAt: "desc" }, take: 3 }),
      db.patient.count({ where: { clinicId } }),
      db.treatmentPlan.count({ where: { clinicId, status: { in: ["DRAFT", "PRESENTED", "ACCEPTED", "IN_PROGRESS"] } } }),
    ]);
    patientCount = patientsTotal;
    planCount = plansTotal;
    appointments = appointmentsToday.map((appointment) => ({ time: new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", hour12: true }).format(appointment.startTime), name: `${appointment.patient.firstName} ${appointment.patient.lastName}`, treatment: appointment.reason ?? "Dental visit", chair: appointment.chair.name, color: "sky", status: appointment.status === "IN_CHAIR" ? "Checked in" : appointment.status === "COMPLETED" ? "Completed" : "Confirmed" }));
    recentPatients = patientRows.map((patient) => ({ id: patient.id, initials: `${patient.firstName[0] ?? ""}${patient.lastName[0] ?? ""}`, name: `${patient.firstName} ${patient.lastName}`, detail: patient.appointments[0] ? `${patient.appointments[0].reason ?? "Dental visit"} · today, ${new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit" }).format(patient.appointments[0].startTime)}` : `Patient since ${patient.createdAt.toLocaleDateString("en-PH", { month: "short", year: "numeric", timeZone: "Asia/Manila" })}`, bg: "#dff1ed", color: "#26796f" }));
  } catch { /* Keep the dashboard preview visible until the demo database is ready. */ }
  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Saturday, October 10, 2026</p><h1 className="text-[26px] font-semibold tracking-tight text-slate-800">Good morning, Dr. Maria <span className="inline-block origin-bottom animate-[wave_1.5s_ease-in-out_infinite]">☀️</span></h1><p className="mt-1 text-sm text-slate-500">Here’s what’s happening at your clinic today.</p></div>
      <div className="flex gap-2"><Button variant="secondary" size="sm"><CalendarDays size={15} /> Today</Button><AddPatientDialog /></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric title="Appointments today" value={String(appointments.length)} caption="Across your operatories" icon={<CalendarDays size={17} />} color="sky" trend="Today" />
      <Metric title="Active patients" value={patientCount.toLocaleString("en-PH")} caption="Across your clinic" icon={<UsersRound size={17} />} color="blue" trend="Clinic" />
      <Metric title="Revenue this month" value={formatPHP(186450)} caption="vs. ₱164,200 last month" icon={<ArrowUpRight size={17} />} color="violet" trend="+13.5%" />
      <Metric title="Treatment plans" value={String(planCount)} caption="Open care plans" icon={<Sparkles size={17} />} color="amber" trend="Active" />
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <Card className="overflow-hidden p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between"><div><h2 className="text-sm font-semibold text-slate-800">Today’s appointments</h2><p className="mt-1 text-xs text-slate-500">A quick look at your clinic schedule</p></div><Link href="/calendar" className="flex items-center gap-1 text-xs font-semibold text-sky-800 hover:text-sky-950">View calendar <ArrowRight size={14} /></Link></div>
        <div className="grid grid-cols-[82px_1fr]">
          <div className="space-y-0">{todayAppointments.map((item) => <div key={item.time} className="flex h-[82px] items-start border-r border-slate-100 pr-3 pt-4 text-[11px] font-medium text-slate-400">{item.time}</div>)}</div>
          <div>{appointments.map((item) => <div key={`${item.name}-${item.time}`} className="flex h-[82px] items-center border-b border-slate-100 pl-4 last:border-0">
            <div className={`mr-3 h-11 w-1 rounded-full ${item.color === "sky" ? "bg-sky-500" : item.color === "blue" ? "bg-blue-400" : item.color === "amber" ? "bg-amber-400" : "bg-violet-400"}`} />
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold text-slate-800">{item.name}</p>{item.status === "Checked in" && <Badge tone="green">Checked in</Badge>}</div><p className="mt-1 truncate text-[11px] text-slate-500">{item.treatment} <span className="px-1 text-slate-300">·</span>{item.chair}</p></div>
            {item.status !== "Checked in" && <Badge tone="blue">{item.status}</Badge>}
          </div>)}</div>
        </div>
      </Card>
      <Card className="p-5 sm:p-6">
        <div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold text-slate-800">Revenue overview</h2><p className="mt-1 text-xs text-slate-500">Monthly clinic collections</p></div><button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><MoreHorizontal size={17} /></button></div>
        <div className="mt-5 flex items-end gap-2"><span className="text-[27px] font-semibold tracking-tight">₱186,450</span><span className="mb-1 flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700"><ArrowUpRight size={13} />13.5%</span></div>
        <div className="mt-5 flex h-[150px] items-end gap-2 border-b border-slate-100 pb-2">{bars.map((height, index) => <div key={index} className="group relative flex h-full flex-1 items-end"><div style={{ height: `${height}%` }} className={`w-full rounded-t-md transition hover:bg-sky-600 ${index === 9 ? "bg-sky-700" : "bg-[#dcebe8]"}`} /></div>)}</div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>Sep 15</span><span>Sep 22</span><span>Sep 29</span><span>Oct 6</span><span>Oct 10</span></div>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f5f8f8] p-3"><div className="flex items-center gap-2.5"><div className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sky-700"><Clock3 size={15} /></div><div><p className="text-[11px] font-semibold">Average daily revenue</p><p className="text-[10px] text-slate-400">This month</p></div></div><strong className="text-xs">₱8,884</strong></div>
      </Card>
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between"><div><h2 className="text-sm font-semibold">Recent patients</h2><p className="mt-1 text-xs text-slate-500">Latest patient activity</p></div><Link href="/patients" className="text-xs font-semibold text-sky-800">View all</Link></div>
        <div className="divide-y divide-slate-100">{recentPatients.map((patient) => <Link href={`/patients/${patient.id}`} key={patient.id} className="flex items-center gap-3 py-3.5"><span className="grid h-9 w-9 place-items-center rounded-full text-[11px] font-bold" style={{ backgroundColor: patient.bg, color: patient.color }}>{patient.initials}</span><span className="flex-1"><span className="block text-xs font-semibold">{patient.name}</span><span className="mt-1 block text-[10px] text-slate-400">{patient.detail}</span></span><ArrowRight size={15} className="text-slate-300" /></Link>)}</div>
      </Card>
      <Card className="relative overflow-hidden bg-[#153d3a] p-5 text-white sm:p-6">
        <div className="absolute -right-8 -top-9 h-44 w-44 rounded-full border border-white/10" /><div className="absolute -right-2 -top-3 h-32 w-32 rounded-full border border-white/10" />
        <div className="relative flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10"><Sparkles size={17} /></div><div><Badge className="bg-white/15 text-white">Clinic insight</Badge><h3 className="mt-3 text-base font-semibold">Your patients are staying on track</h3><p className="mt-2 max-w-md text-xs leading-5 text-white/70">Your recall rate is up 12% this month. Keep the momentum going by sending a gentle reminder to patients due for a follow-up.</p><Link href="/calendar" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-sky-900 hover:bg-sky-50">Review upcoming visits <ArrowRight size={14} /></Link></div></div>
        <div className="relative mt-6 flex gap-8 border-t border-white/15 pt-4"><div><p className="text-[10px] text-white/55">Recall rate</p><p className="mt-1 text-lg font-semibold">78%</p></div><div><p className="text-[10px] text-white/55">Due this week</p><p className="mt-1 text-lg font-semibold">16 <span className="text-xs font-normal text-white/55">patients</span></p></div></div>
      </Card>
    </div>
  </div>;
}

function Metric({ title, value, caption, icon, color, trend }: { title: string; value: string; caption: string; icon: React.ReactNode; color: "sky" | "blue" | "violet" | "amber"; trend: string }) {
  const colors = { sky: "bg-sky-50 text-sky-700", blue: "bg-blue-50 text-blue-700", violet: "bg-violet-50 text-violet-700", amber: "bg-amber-50 text-amber-700" };
  return <Card className="p-4 sm:p-5"><div className="flex items-start justify-between"><span className={`grid h-9 w-9 place-items-center rounded-xl ${colors[color]}`}>{icon}</span><span className="flex items-center gap-0.5 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700"><ArrowUpRight size={12} />{trend}</span></div><p className="mt-4 text-[25px] font-semibold tracking-tight">{value}</p><p className="mt-0.5 text-xs font-medium text-slate-600">{title}</p><p className="mt-2 text-[10px] text-slate-400">{caption}</p></Card>;
}
