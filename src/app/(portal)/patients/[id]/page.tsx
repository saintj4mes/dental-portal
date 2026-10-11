import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowLeft, CalendarPlus, FileText, HeartPulse, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { db } from "@/shared/db";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { OdontogramChart } from "@/modules/odontogram/components/OdontogramChart";
import { ClinicalNoteDialog, TreatmentPlanDialog } from "@/modules/treatments/components/PatientClinicalActions";
import { demoPatientId, demoPatients } from "@/modules/patients/data/demo-patients";
import { getClinicId } from "@/shared/lib/clinic-context";
import type { ToothSurfaceMap } from "@/modules/odontogram/types";
import { PatientAttachmentLibrary, type PatientAttachmentView } from "@/modules/documents/components/PatientAttachmentLibrary";
import { PatientContextCards, type PatientCommunicationView, type PatientRelationshipView } from "@/modules/patients/components/PatientContextCards";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let patient: { id: string; firstName: string; lastName: string; mobileNumber: string; email: string | null; birthDate: Date | null; medicalAlerts: string[]; allergies: string[]; seniorPwdId: string | null; createdAt: Date; toothRecords: Array<{ toothNumber: number; overallStatus: "HEALTHY" | "MISSING" | "IMPACTED" | "CROWN" | "BRIDGE" | "IMPLANT" | "EXTRACTION_INDICATED" | "ENDO_TREATED"; surfaces: unknown }> } | null = null;
  let clinicalHistory: Array<{ id: string; createdAt: Date; assessment: string; dentist: { name: string } }> = [];
  let plans: Array<{ id: string; title: string; status: string; items: Array<{ name: string; quantity: number; unitPrice: unknown }> }> = [];
  let attachments: PatientAttachmentView[] = [];
  let relationships: PatientRelationshipView[] = [];
  let communications: PatientCommunicationView[] = [];
  let appointments: Array<{ id: string; startTime: Date; status: string; reason: string | null }> = [];
  let invoices: Array<{ id: string; createdAt: Date; invoiceNumber: string; patientDueAmount: unknown }> = [];
  try { patient = await db.patient.findFirst({ where: { id, clinicId: await getClinicId() }, include: { toothRecords: true } }); } catch { patient = null; }
  if (patient) try {
    const clinicId = await getClinicId();
    const [notes, treatmentPlans, patientFiles, patientRelations, contactLogs, visits, invoicesList] = await Promise.all([
      db.clinicalNote.findMany({ where: { patientId: patient.id }, include: { dentist: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
      db.treatmentPlan.findMany({ where: { patientId: patient.id, status: { notIn: ["COMPLETED", "DECLINED"] } }, include: { items: true }, orderBy: { createdAt: "desc" }, take: 5 }),
      db.patientAttachment.findMany({ where: { clinicId, patientId: patient.id }, orderBy: { createdAt: "desc" } }),
      db.patientRelationship.findMany({ where: { clinicId, patientId: patient.id }, orderBy: [{ isEmergencyContact: "desc" }, { name: "asc" }] }),
      db.patientCommunication.findMany({ where: { clinicId, patientId: patient.id }, orderBy: { occurredAt: "desc" }, take: 15 }),
      db.appointment.findMany({ where: { clinicId, patientId: patient.id }, orderBy: { startTime: "desc" }, take: 20, select: { id: true, startTime: true, status: true, reason: true } }),
      db.invoice.findMany({ where: { clinicId, patientId: patient.id }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, createdAt: true, invoiceNumber: true, patientDueAmount: true } }),
    ]);
    clinicalHistory = notes;
    plans = treatmentPlans;
    attachments = patientFiles.map((file) => ({ id: file.id, fileName: file.fileName, mimeType: file.mimeType, byteSize: file.byteSize, category: file.category, caption: file.caption, createdAt: file.createdAt.toISOString() }));
    relationships = patientRelations;
    communications = contactLogs.map((log) => ({ ...log, occurredAt: log.occurredAt.toISOString(), followUpAt: log.followUpAt?.toISOString() ?? null }));
    appointments = visits;
    invoices = invoicesList;
  } catch { /* The patient overview remains available if history tables are unavailable. */ }
  if (!patient && id !== demoPatientId) notFound();
  const fallback = demoPatients.find((entry) => entry.id === id);
  const person = patient ?? (fallback ? { id, firstName: fallback.name.split(" ")[0] ?? "Sofia", lastName: fallback.name.split(" ").slice(1).join(" ") || "Reyes", mobileNumber: fallback.mobileNumber, email: fallback.email, birthDate: new Date("1994-05-17"), medicalAlerts: fallback.alerts, allergies: [], seniorPwdId: fallback.seniorPwd ? "SC-2026-0041" : null, createdAt: new Date("2025-04-12"), toothRecords: [] } : null);
  if (!person) notFound();
  const years = person.birthDate ? Math.floor((Date.now() - person.birthDate.getTime()) / 31_557_600_000) : null;
  const chart = (patient?.toothRecords ?? []).map((record) => ({ toothNumber: record.toothNumber, overallStatus: record.overallStatus, surfaces: record.surfaces as unknown as ToothSurfaceMap }));
  const timeline = [
    ...clinicalHistory.map((note) => ({ id: `note-${note.id}`, at: note.createdAt, title: note.assessment, detail: `Clinical note · ${note.dentist.name}`, status: "RECORDED" })),
    ...appointments.map((visit) => ({ id: `appointment-${visit.id}`, at: visit.startTime, title: visit.reason || "Patient appointment", detail: "Clinic visit", status: visit.status })),
    ...invoices.map((invoice) => ({ id: `invoice-${invoice.id}`, at: invoice.createdAt, title: `Invoice ${invoice.invoiceNumber}`, detail: `Patient balance ${new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(invoice.patientDueAmount))}`, status: "BILLED" })),
    ...communications.map((log) => ({ id: `communication-${log.id}`, at: new Date(log.occurredAt), title: log.subject, detail: `${log.direction.toLowerCase()} ${log.channel.toLowerCase().replaceAll("_", " ")} contact${log.summary ? ` · ${log.summary}` : ""}`, status: log.outcome || "CONTACTED" })),
    ...attachments.map((file) => ({ id: `file-${file.id}`, at: new Date(file.createdAt), title: file.fileName, detail: `${file.category.toLowerCase().replaceAll("_", " ")} added to patient record`, status: "FILED" })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 15);

  return <div className="space-y-6">
    <Link href="/patients" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-sky-800"><ArrowLeft size={14} /> Back to patients</Link>
    <Card className="overflow-hidden"><div className="h-24 bg-[linear-gradient(110deg,#d8ede7,#eff5f1_55%,#f4eede)]" /><div className="px-5 pb-5 sm:px-7"><div className="-mt-8 flex flex-wrap items-end justify-between gap-4"><div className="flex items-end gap-3"><div className="grid h-[68px] w-[68px] place-items-center rounded-2xl border-4 border-white bg-[#e0f0ec] text-lg font-bold text-sky-800 shadow-sm">{person.firstName[0]}{person.lastName[0]}</div><div className="pb-1"><h1 className="text-xl font-semibold">{person.firstName} {person.lastName}</h1><p className="mt-1 text-xs text-slate-500">Patient since {person.createdAt.toLocaleDateString("en-PH", { month: "long", year: "numeric" })} {years !== null && <span>· {years} years old</span>}</p></div></div><div className="flex gap-2"><ClinicalNoteDialog patientId={person.id} /><Link href="/calendar" className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-700 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-800"><CalendarPlus size={15} /> Schedule visit</Link></div></div>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><span className="flex items-center gap-2"><Phone size={14} />{person.mobileNumber}</span>{person.email && <span className="flex items-center gap-2"><Mail size={14} />{person.email}</span>}<span className="flex items-center gap-2"><MapPin size={14} />Pasig City, Metro Manila</span>{person.seniorPwdId && <Badge tone="blue"><ShieldCheck size={12} className="mr-1" /> SC / PWD ID on file</Badge>}</div>
    </div></Card>
    {patient && <Link href={`/patients/${person.id}/periodontogram`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-sky-300"><Activity size={14} className="text-sky-700" /> Open periodontal chart</Link>}
    <div className="grid gap-5 xl:grid-cols-[1.55fr_0.8fr]">
      <div className="space-y-5"><OdontogramChart patientId={person.id} initialRecords={chart} /><Card className="p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Patient timeline</h2><p className="mt-1 text-xs text-slate-500">Clinical notes, visits, billing, files, and contact history</p></div></div><div className="relative ml-2 border-l border-slate-200 pl-5">{timeline.length ? timeline.map((event, index) => <HistoryItem key={event.id} date={event.at.toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric", timeZone: "Asia/Manila" })} title={event.title} detail={event.detail} status={event.status.replaceAll("_", " ")} last={index === timeline.length - 1} />) : id === demoPatientId ? <><HistoryItem date="Oct 07, 2026" title="Routine cleaning & polishing" detail="Prophylaxis · Dr. Maria Cruz" status="Completed" /><HistoryItem date="Jul 14, 2026" title="Composite restoration · Tooth #36" detail="Occlusal surface · Dr. Maria Cruz" status="Completed" /><HistoryItem date="Apr 12, 2026" title="New patient examination" detail="Comprehensive exam · Dr. Maria Cruz" status="Completed" last /></> : <p className="py-2 text-xs text-slate-400">No patient activity has been recorded yet.</p>}</div></Card></div>
      <div className="space-y-5"><Card className="p-5"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-700"><HeartPulse size={16} /></span><h2 className="text-sm font-semibold">Health profile</h2></div><div className="mt-4 space-y-4"><HealthLine title="Medical alerts" items={person.medicalAlerts} empty="No medical alerts recorded" /><HealthLine title="Known allergies" items={person.allergies} empty="No known allergies" /></div></Card>
        <Card className="p-5"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-700"><Activity size={16} /></span><h2 className="text-sm font-semibold">Next appointment</h2></div><div className="mt-4 rounded-xl bg-[#f5f8f8] p-4"><Badge tone="green">Today · 9:00 AM</Badge><p className="mt-3 text-sm font-semibold">Cleaning & polishing</p><p className="mt-1 text-xs text-slate-500">Operatory 1 · Dr. Maria Cruz</p><div className="mt-3 border-t border-slate-200/70 pt-3 text-[11px] text-slate-500">Please arrive 10 minutes early.</div></div><button className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">View all appointments</button></Card>
        <Card className="p-5"><h2 className="text-sm font-semibold">Treatment plan</h2><p className="mt-1 text-xs text-slate-500">Current care recommendations</p>{plans.length ? <div className="mt-3 space-y-3">{plans.map((plan) => <div key={plan.id} className="rounded-xl bg-slate-50 p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold">{plan.title}</p><Badge tone="blue">{plan.status.toLowerCase().replaceAll("_", " ")}</Badge></div><div className="mt-2 space-y-1">{plan.items.map((item, index) => <div key={`${plan.id}-${index}`} className="flex justify-between gap-2 text-[10px] text-slate-500"><span>{item.quantity} × {item.name}</span><span>{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(item.unitPrice) * item.quantity)}</span></div>)}</div></div>)}<TreatmentPlanDialog patientId={person.id} /></div> : <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-center"><div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700"><FileText size={16} /></div><p className="mt-2 text-xs font-medium">No active treatment plan</p><TreatmentPlanDialog patientId={person.id} /></div>}</Card></div>
    </div>
    {patient && <PatientContextCards patientId={person.id} relationships={relationships} communications={communications} />}
    {patient && <PatientAttachmentLibrary patientId={person.id} attachments={attachments} />}
  </div>;
}

function HistoryItem({ date, title, detail, status, last }: { date: string; title: string; detail: string; status: string; last?: boolean }) {
  return <div className={`relative pb-5 ${last ? "pb-0" : ""}`}><span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-sky-600 ring-1 ring-sky-200" /><p className="text-[10px] font-medium text-slate-400">{date}</p><div className="mt-1 flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-800">{title}</p><Badge tone="green">{status}</Badge></div><p className="mt-1 text-[11px] text-slate-500">{detail}</p></div>;
}
function HealthLine({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>{items.length ? <div className="mt-2 flex flex-wrap gap-1.5">{items.map((item) => <Badge tone="amber" key={item}>{item}</Badge>)}</div> : <p className="mt-1.5 text-xs text-slate-500">{empty}</p>}</div>;
}
