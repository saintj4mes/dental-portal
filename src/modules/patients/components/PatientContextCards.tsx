"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ContactRound, MessageSquareText, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { createPatientCommunication, createPatientRelationship, deletePatientRelationship } from "../actions/patient-context";

export interface PatientRelationshipView { id: string; name: string; relationship: string; mobileNumber: string | null; email: string | null; isEmergencyContact: boolean; isGuardian: boolean; notes: string | null }
export interface PatientCommunicationView { id: string; channel: string; direction: string; subject: string; summary: string | null; outcome: string | null; followUpAt: string | null; occurredAt: string }

export function PatientContextCards({ patientId, relationships, communications }: { patientId: string; relationships: PatientRelationshipView[]; communications: PatientCommunicationView[] }) {
  return <div className="grid gap-5 xl:grid-cols-2"><RelationshipCard patientId={patientId} relationships={relationships} /><CommunicationCard patientId={patientId} communications={communications} /></div>;
}

function RelationshipCard({ patientId, relationships }: { patientId: string; relationships: PatientRelationshipView[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createPatientRelationship({ patientId, name: data.get("name"), relationship: data.get("relationship"), mobileNumber: data.get("mobileNumber"), email: data.get("email"), notes: data.get("notes"), isEmergencyContact: data.get("isEmergencyContact") === "on", isGuardian: data.get("isGuardian") === "on" });
      if (!result.success) { setError(result.error); return; }
      setOpen(false); router.refresh();
    });
  }
  return <Card className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-md bg-sky-50 text-sky-700"><ContactRound size={16} /></span><div><h2 className="text-sm font-semibold text-slate-900">Patient relationships</h2><p className="mt-0.5 text-[11px] text-[#94908a]">Guardians and emergency contacts</p></div></div><Button size="sm" variant="secondary" onClick={() => setOpen(!open)}><Plus size={14} /> Add</Button></div>
    {open && <form onSubmit={submit} className="mt-4 grid gap-2.5 rounded-md bg-[#fbfaf8] p-3 sm:grid-cols-2"><input required name="name" placeholder="Full name" className="h-9 rounded-md border border-[var(--color-border)] bg-white px-2.5 text-xs" /><input required name="relationship" placeholder="Relationship to patient" className="h-9 rounded-md border border-[var(--color-border)] bg-white px-2.5 text-xs" /><input name="mobileNumber" placeholder="Mobile number" className="h-9 rounded-md border border-[var(--color-border)] bg-white px-2.5 text-xs" /><input name="email" type="email" placeholder="Email" className="h-9 rounded-md border border-[var(--color-border)] bg-white px-2.5 text-xs" /><label className="flex items-center gap-2 text-[11px] text-[#615d59]"><input name="isEmergencyContact" type="checkbox" /> Emergency contact</label><label className="flex items-center gap-2 text-[11px] text-[#615d59]"><input name="isGuardian" type="checkbox" /> Legal guardian</label><textarea name="notes" rows={2} placeholder="Notes" className="rounded-md border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs sm:col-span-2" />{error && <p role="alert" className="text-xs text-red-700 sm:col-span-2">{error}</p>}<div className="flex justify-end gap-2 sm:col-span-2"><Button size="sm" variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" type="submit" disabled={pending}>{pending ? "Saving…" : "Save contact"}</Button></div></form>}
    <div className="mt-4 divide-y divide-black/[0.05]">{relationships.length ? relationships.map((contact) => <div key={contact.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#efede9] text-[10px] font-semibold text-[#615d59]">{contact.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-1.5"><p className="text-xs font-semibold text-slate-900">{contact.name}</p><span className="text-[10px] text-[#94908a]">{contact.relationship}</span>{contact.isEmergencyContact && <Badge tone="amber">Emergency</Badge>}{contact.isGuardian && <Badge tone="blue">Guardian</Badge>}</div><p className="mt-1 text-[11px] text-[#615d59]">{[contact.mobileNumber, contact.email].filter(Boolean).join(" · ") || "No contact details"}</p></div><button type="button" aria-label={`Remove ${contact.name}`} disabled={pending} onClick={() => startTransition(async () => { const result = await deletePatientRelationship({ id: contact.id }); if (!result.success) setError(result.error); else router.refresh(); })} className="rounded p-1 text-[#94908a] hover:bg-red-50 hover:text-red-700"><Trash2 size={14} /></button></div>) : <p className="py-4 text-center text-xs text-[#94908a]">No related contacts recorded.</p>}</div>
  </Card>;
}

function CommunicationCard({ patientId, communications }: { patientId: string; communications: PatientCommunicationView[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createPatientCommunication({ patientId, channel: data.get("channel"), direction: data.get("direction"), subject: data.get("subject"), summary: data.get("summary"), outcome: data.get("outcome"), followUpAt: data.get("followUpAt") });
      if (!result.success) { setError(result.error); return; }
      setOpen(false); router.refresh();
    });
  }
  return <Card className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-md bg-sky-50 text-sky-700"><MessageSquareText size={16} /></span><div><h2 className="text-sm font-semibold text-slate-900">Contact history</h2><p className="mt-0.5 text-[11px] text-[#94908a]">Staff-logged patient communications</p></div></div><Button size="sm" variant="secondary" onClick={() => setOpen(!open)}><Plus size={14} /> Log contact</Button></div>
    {open && <form onSubmit={submit} className="mt-4 grid gap-2.5 rounded-md bg-[#fbfaf8] p-3 sm:grid-cols-2"><select name="channel" className="h-9 rounded-md border border-[var(--color-border)] bg-white px-2.5 text-xs"><option value="PHONE">Phone</option><option value="EMAIL">Email</option><option value="IN_PERSON">In person</option><option value="OTHER">Other</option></select><select name="direction" className="h-9 rounded-md border border-[var(--color-border)] bg-white px-2.5 text-xs"><option value="OUTBOUND">Outbound</option><option value="INBOUND">Inbound</option></select><input required name="subject" placeholder="Contact subject" className="h-9 rounded-md border border-[var(--color-border)] bg-white px-2.5 text-xs sm:col-span-2" /><textarea name="summary" rows={2} placeholder="Summary" className="rounded-md border border-[var(--color-border)] bg-white px-2.5 py-2 text-xs sm:col-span-2" /><input name="outcome" placeholder="Outcome" className="h-9 rounded-md border border-[var(--color-border)] bg-white px-2.5 text-xs" /><input name="followUpAt" type="datetime-local" aria-label="Follow-up time" className="h-9 rounded-md border border-[var(--color-border)] bg-white px-2.5 text-xs" />{error && <p role="alert" className="text-xs text-red-700 sm:col-span-2">{error}</p>}<div className="flex justify-end gap-2 sm:col-span-2"><Button size="sm" variant="secondary" type="button" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" type="submit" disabled={pending}>{pending ? "Saving…" : "Save contact log"}</Button></div></form>}
    <div className="mt-4 divide-y divide-black/[0.05]">{communications.length ? communications.map((log) => <div key={log.id} className="py-3 first:pt-0 last:pb-0"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-900">{log.subject}</p><p className="mt-1 text-[10px] text-[#94908a]">{log.direction.toLowerCase()} · {log.channel.toLowerCase().replaceAll("_", " ")} · {new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(log.occurredAt))}</p></div>{log.outcome && <Badge tone="neutral">{log.outcome}</Badge>}</div>{log.summary && <p className="mt-2 text-xs leading-5 text-[#615d59]">{log.summary}</p>}{log.followUpAt && <p className="mt-2 text-[10px] font-medium text-sky-800">Follow-up: {new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" }).format(new Date(log.followUpAt))}</p>}</div>) : <p className="py-4 text-center text-xs text-[#94908a]">No contact history recorded.</p>}</div>
  </Card>;
}
