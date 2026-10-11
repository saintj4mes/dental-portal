import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PeriodontalChartEditor } from "@/modules/periodontogram/components/PeriodontalChartEditor";

export const dynamic = "force-dynamic";

export default async function PatientPeriodontogramPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ exam?: string }> }) {
  const [{ id }, query, clinicId] = await Promise.all([params, searchParams, getClinicId()]);
  const patient = await db.patient.findFirst({ where: { id, clinicId }, select: { id: true, firstName: true, lastName: true } });
  if (!patient) notFound();
  const exams = await db.periodontalExam.findMany({ where: { clinicId, patientId: id }, orderBy: { examinedAt: "desc" }, include: { _count: { select: { sites: true } } } });
  const activeExam = (query.exam ? exams.find((exam) => exam.id === query.exam) : null) ?? exams[0] ?? null;
  const values = activeExam ? await db.periodontalMeasurement.findMany({ where: { examId: activeExam.id }, orderBy: [{ toothNumber: "asc" }, { site: "asc" }] }) : [];
  return <div className="space-y-5">
    <Link href={`/patients/${id}`} className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-sky-800"><ArrowLeft size={14} /> Back to {patient.firstName} {patient.lastName}</Link>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">Clinical chart</p><h1 className="mt-1 text-xl font-semibold">Periodontal chart</h1><p className="mt-1 text-xs text-slate-500">{patient.firstName} {patient.lastName} · FDI notation · six sites per tooth</p></div>{activeExam && <div className="flex items-center gap-2"><CalendarDays size={15} className="text-slate-400" /><span className="text-xs text-slate-500">Exam {activeExam.examinedAt.toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" })}</span><Badge tone="blue">{values.length} sites</Badge></div>}</div>
    {exams.length > 1 && <Card className="flex flex-wrap gap-2 p-3">{exams.map((exam) => <Link key={exam.id} href={`/patients/${id}/periodontogram?exam=${exam.id}`} className={`rounded-lg px-3 py-2 text-xs ${exam.id === activeExam?.id ? "bg-sky-700 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{exam.examinedAt.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" })}<span className="ml-2 opacity-75">{exam._count.sites} sites</span></Link>)}</Card>}
    <PeriodontalChartEditor patientId={id} examId={activeExam?.id ?? null} notes={activeExam?.notes ?? ""} values={values.map((value) => ({ toothNumber: value.toothNumber, site: value.site, pocketDepth: value.pocketDepth, recession: value.recession, bleeding: value.bleeding, suppuration: value.suppuration, mobility: value.mobility, furcation: value.furcation }))} />
  </div>;
}
