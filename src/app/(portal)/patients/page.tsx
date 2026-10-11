import { ArrowDownToLine, UsersRound } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { AddPatientDialog } from "@/modules/patients/components/AddPatientDialog";
import { PatientsTable } from "@/modules/patients/components/PatientsTable";
import { demoPatients } from "@/modules/patients/data/demo-patients";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import type { PatientListItem } from "@/modules/patients/types";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  let patients: PatientListItem[] = demoPatients;
  let appointmentsThisWeek = 46;
  let recallsDue = 16;
  try {
    const clinicId = await getClinicId();
    const rows = await db.patient.findMany({ where: { clinicId }, include: { appointments: { where: { status: { notIn: ["CANCELLED", "NO_SHOW"] } }, orderBy: { startTime: "asc" }, take: 20 } }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }] });
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const [weekCount, recallCount] = await Promise.all([
      db.appointment.count({ where: { clinicId, startTime: { gte: now, lt: weekEnd }, status: { notIn: ["CANCELLED", "NO_SHOW"] } } }),
      db.workspaceRecord.count({ where: { clinicId, module: "recalls", status: "DUE" } }),
    ]);
    appointmentsThisWeek = weekCount;
    recallsDue = recallCount;
    patients = rows.map((patient) => {
      const now = Date.now(); const next = patient.appointments.find((appointment) => appointment.startTime.getTime() >= now);
      const last = [...patient.appointments].reverse().find((appointment) => appointment.status === "COMPLETED");
      return { id: patient.id, name: `${patient.firstName} ${patient.lastName}`, mobileNumber: patient.mobileNumber, email: patient.email, lastVisit: last?.startTime.toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric", timeZone: "Asia/Manila" }) ?? null, nextAppointment: next?.startTime.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }) ?? null, alerts: [...patient.medicalAlerts, ...patient.allergies], seniorPwd: Boolean(patient.seniorPwdId) };
    });
  } catch { /* Keep the preview list visible until a clinic database is connected. */ }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Patient care</p><h1 className="text-[26px] font-semibold tracking-tight">Patients</h1><p className="mt-1 text-sm text-slate-500">A complete picture of every patient, all in one place.</p></div><div className="flex gap-2"><Button variant="secondary"><ArrowDownToLine size={15} /> Export</Button><AddPatientDialog /></div></div>
    <div className="grid gap-4 sm:grid-cols-3"><Summary title="Total patients" value={patients.length.toLocaleString("en-PH")} hint="Clinic records" icon={<UsersRound size={16} />} /><Summary title="Appointments this week" value={String(appointmentsThisWeek)} hint="Across active operatories" icon={<span className="text-sm">◷</span>} /><Summary title="Recall due" value={String(recallsDue)} hint="Follow-up recommended" icon={<span className="text-sm">↻</span>} /></div>
    <Card className="overflow-hidden"><div className="flex items-center justify-between px-5 py-4"><div><h2 className="text-sm font-semibold">All patients</h2><p className="mt-1 text-[11px] text-slate-400">Recently active patient records</p></div><span className="text-[11px] text-slate-400">Showing {patients.length} patient records</span></div><PatientsTable patients={patients} /></Card>
  </div>;
}

function Summary({ title, value, hint, icon }: { title: string; value: string; hint: string; icon: React.ReactNode }) {
  return <Card className="flex items-center gap-3.5 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700">{icon}</span><div><p className="text-[11px] text-slate-500">{title}</p><div className="mt-0.5 flex items-baseline gap-2"><span className="text-xl font-semibold">{value}</span><span className="text-[10px] text-emerald-700">{hint}</span></div></div></Card>;
}
