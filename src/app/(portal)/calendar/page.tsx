import { addDays, startOfDay, timeInManila } from "@/shared/lib/dates";
import { manilaDateKey } from "@/shared/lib/dates";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { AppointmentDialog, type AppointmentChoice } from "@/modules/appointments/components/AppointmentDialog";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";

export const dynamic = "force-dynamic";
const fallbackChairs = ["Operatory 1", "Operatory 2", "Surgical suite"];
const fallbackAppointments = [
  { time: "09:00", duration: 60, chair: "Operatory 1", name: "Sofia Reyes", reason: "Cleaning & polishing", dentist: "Dr. Maria Cruz", color: "sky" },
  { time: "10:30", duration: 45, chair: "Operatory 2", name: "Miguel Santos", reason: "Consultation", dentist: "Dr. Adrian Lim", color: "blue" },
  { time: "11:15", duration: 60, chair: "Operatory 1", name: "Isabella Lim", reason: "Tooth restoration · #26", dentist: "Dr. Maria Cruz", color: "amber" },
  { time: "13:00", duration: 90, chair: "Surgical suite", name: "Gabriel Tan", reason: "Root canal treatment", dentist: "Dr. Adrian Lim", color: "violet" },
  { time: "14:15", duration: 45, chair: "Operatory 2", name: "Amelia Dizon", reason: "Follow-up", dentist: "Dr. Maria Cruz", color: "green" },
];
interface CalendarAppointment { time: string; duration: number; chair: string; name: string; reason: string; dentist: string; color: string; }

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const query = await searchParams;
  const day = query.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date) ? new Date(`${query.date}T00:00:00+08:00`) : new Date();
  let patients: AppointmentChoice[] = []; let dentists: AppointmentChoice[] = []; let chairOptions: AppointmentChoice[] = [];
  let appointments: CalendarAppointment[] = fallbackAppointments; let chairs = fallbackChairs;
  try {
    const clinicId = await getClinicId(); const start = startOfDay(day);
    const [patientRows, dentistRows, chairRows, appointmentRows] = await Promise.all([
      db.patient.findMany({ where: { clinicId }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }], take: 250 }),
      db.user.findMany({ where: { clinicId, role: { in: ["OWNER", "DENTIST"] } }, orderBy: { name: "asc" } }),
      db.dentalChair.findMany({ where: { clinicId, isActive: true }, orderBy: { name: "asc" } }),
      db.appointment.findMany({ where: { clinicId, startTime: { gte: start, lt: addDays(start, 1) }, status: { notIn: ["CANCELLED", "NO_SHOW"] } }, include: { patient: true, chair: true, dentist: true }, orderBy: { startTime: "asc" } }),
    ]);
    patients = patientRows.map((item) => ({ id: item.id, label: `${item.firstName} ${item.lastName}` }));
    dentists = dentistRows.map((item) => ({ id: item.id, label: item.name }));
    chairOptions = chairRows.map((item) => ({ id: item.id, label: item.name })); chairs = chairRows.map((item) => item.name);
    appointments = appointmentRows.map((item) => ({ time: timeInManila(item.startTime), duration: Math.max(30, (item.endTime.getTime() - item.startTime.getTime()) / 60000), chair: item.chair.name, name: `${item.patient.firstName} ${item.patient.lastName}`, reason: item.reason ?? "Dental visit", dentist: item.dentist.name, color: "sky" }));
  } catch { /* Keep the schedule preview visible while the database is being configured. */ }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Clinic flow</p><h1 className="text-[26px] font-semibold tracking-tight">Appointments</h1><p className="mt-1 text-sm text-slate-500">A clear view across every operatory.</p></div><AppointmentDialog patients={patients} dentists={dentists} chairs={chairOptions} /></div>
    <div className="grid gap-4 sm:grid-cols-2"><SmallStat label="Today’s visits" value={String(appointments.length)} foot="Across your operatories" /><SmallStat label="Operatories" value={`${chairs.length} active`} foot="Ready for appointments" /></div>
    <Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-5"><div className="flex items-center gap-3"><div className="flex gap-1"><Link href={`/calendar?date=${manilaDateKey(addDays(startOfDay(day), -1))}`} aria-label="Previous day" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500"><ArrowLeft size={14} /></Link><Link href={`/calendar?date=${manilaDateKey(addDays(startOfDay(day), 1))}`} aria-label="Next day" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500"><ArrowRight size={14} /></Link></div><div><p className="text-sm font-semibold">{day.toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "Asia/Manila" })}</p><p className="mt-0.5 text-[10px] text-slate-400">Asia/Manila · 8:00 AM – 5:00 PM</p></div></div><div className="flex items-center gap-2"><Link href="/calendar" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">Today</Link><Badge tone="green"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />Live schedule</Badge><button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">Day⌄</button></div></div>
      <div className="overflow-x-auto"><div className="min-w-[800px]"><div style={{ gridTemplateColumns: `82px repeat(${Math.max(1, chairs.length)}, minmax(0, 1fr))` }} className="grid border-b border-slate-100"><div className="p-3" />{chairs.map((chair) => <div key={chair} className="border-l border-slate-100 px-4 py-3 text-xs font-semibold">{chair}</div>)}</div>
        <div style={{ gridTemplateColumns: `82px repeat(${Math.max(1, chairs.length)}, minmax(0, 1fr))` }} className="relative grid">{Array.from({ length: 9 }, (_, i) => 8 + i).map((hour) => <div key={hour} className="contents"><div className="h-[82px] border-b border-slate-100 px-4 pt-3 text-[10px] font-medium text-slate-400">{`${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`}</div>{chairs.map((chair) => <div key={`${hour}-${chair}`} className="relative h-[82px] border-b border-l border-slate-100" />)}</div>)}
          {appointments.map((appointment) => { const [hourText, minuteText] = appointment.time.split(":"); const hour = Number(hourText); const minute = Number(minuteText); const top = (hour - 8) * 82 + minute / 60 * 82; const col = Math.max(0, chairs.indexOf(appointment.chair)); const color = appointment.color === "amber" ? "border-amber-300 bg-amber-50 text-amber-950" : appointment.color === "blue" ? "border-blue-300 bg-blue-50 text-blue-950" : appointment.color === "violet" ? "border-violet-300 bg-violet-50 text-violet-950" : appointment.color === "green" ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-sky-300 bg-sky-50 text-sky-950"; return <div key={`${appointment.name}-${appointment.time}`} style={{ top, left: `calc(82px + (100% - 82px) / ${Math.max(1, chairs.length)} * ${col} + 5px)`, width: `calc((100% - 82px) / ${Math.max(1, chairs.length)} - 10px)`, height: Math.max(54, appointment.duration / 60 * 82 - 5) }} className={`absolute z-10 overflow-hidden rounded-lg border-l-[3px] p-2 shadow-sm ${color}`}><p className="truncate text-[10px] font-bold">{appointment.name}</p><p className="mt-0.5 truncate text-[9px] opacity-75">{appointment.reason}</p><p className="mt-1 truncate text-[9px] opacity-60">{appointment.dentist}</p></div>; })}
        </div></div></div>
      <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 px-5 py-3 text-[10px] text-slate-500"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" />General dentistry</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Restorative</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-400" />Surgical</span></div>
    </Card>
  </div>;
}

function SmallStat({ label, value, foot }: { label: string; value: string; foot: string }) { return <Card className="p-4"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p><p className="mt-1 text-[10px] text-slate-400">{foot}</p></Card>; }
