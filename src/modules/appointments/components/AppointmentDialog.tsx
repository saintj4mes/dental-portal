"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createAppointment } from "../actions/appointments";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

export interface AppointmentChoice { id: string; label: string; }
function asManilaDateTime(value: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(value);
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}
function fromManilaDateTime(value: string): string { return new Date(`${value}:00+08:00`).toISOString(); }
export function AppointmentDialog({ patients, dentists, chairs }: { patients: AppointmentChoice[]; dentists: AppointmentChoice[]; chairs: AppointmentChoice[] }) {
  const [open, setOpen] = useState(false); const [error, setError] = useState(""); const [busy, startTransition] = useTransition();
  const router = useRouter();
  const [slot] = useState(() => { const start = new Date(Date.now() + 60 * 60 * 1000); start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0); const end = new Date(start.getTime() + 45 * 60 * 1000); return { start: asManilaDateTime(start), end: asManilaDateTime(end) }; });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const data = { patientId: String(form.get("patientId")), dentistId: String(form.get("dentistId")), chairId: String(form.get("chairId")), startTime: fromManilaDateTime(String(form.get("startTime"))), endTime: fromManilaDateTime(String(form.get("endTime"))), reason: String(form.get("reason") ?? ""), status: "CONFIRMED" as const };
    startTransition(async () => { const result = await createAppointment(data); if (!result.success) setError(result.error); else { setOpen(false); setError(""); router.refresh(); } });
  }
  return <><Button onClick={() => setOpen(true)}><Plus size={15} /> New appointment</Button>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex justify-between"><div><h2 className="text-lg font-semibold">Schedule a visit</h2><p className="mt-1 text-sm text-slate-500">Choose a patient, dentist and operatory.</p></div><button onClick={() => setOpen(false)} className="text-slate-400"><X size={18} /></button></div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><Field label="Patient"><select required name="patientId" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="">Choose patient</option>{patients.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}</select></Field><Field label="Dentist"><select required name="dentistId" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="">Choose dentist</option>{dentists.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}</select></Field><Field label="Operatory"><select required name="chairId" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="">Choose chair</option>{chairs.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}</select></Field><Field label="Reason"><Input name="reason" placeholder="e.g. Routine cleaning" /></Field><Field label="Starts"><Input required type="datetime-local" name="startTime" defaultValue={slot.start} /></Field><Field label="Ends"><Input required type="datetime-local" name="endTime" defaultValue={slot.end} /></Field>{error && <p className="sm:col-span-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}<div className="mt-2 flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={busy}>{busy ? "Saving…" : "Confirm appointment"}</Button></div></form></section></div>}</>;
}
