"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { createPatient } from "../actions/patients";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

export function AddPatientDialog() {
  const [open, setOpen] = useState(false); const [error, setError] = useState(""); const [busy, startTransition] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const data = {
      firstName: String(form.get("firstName") ?? ""), lastName: String(form.get("lastName") ?? ""),
      mobileNumber: String(form.get("mobileNumber") ?? ""), email: String(form.get("email") ?? ""), birthDate: String(form.get("birthDate") ?? ""),
      gender: String(form.get("gender") ?? "") || undefined,
      seniorPwdId: String(form.get("seniorPwdId") ?? ""), allergies: String(form.get("allergies") ?? "").split(",").map((item) => item.trim()).filter(Boolean), medicalAlerts: [],
    };
    startTransition(async () => {
      const result = await createPatient(data);
      if (!result.success) { setError(result.error); return; }
      setOpen(false); setError("");
    });
  }
  return <>
    <Button onClick={() => setOpen(true)}><Plus size={16} /> Add patient</Button>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between"><div><h2 className="text-lg font-semibold">Add a patient</h2><p className="mt-1 text-sm text-slate-500">Create a new patient record for this clinic.</p></div><button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button></div>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="First name"><Input name="firstName" required autoFocus placeholder="First name" /></Field>
          <Field label="Last name"><Input name="lastName" required placeholder="Last name" /></Field>
          <Field label="Mobile number"><Input name="mobileNumber" required placeholder="09XX XXX XXXX" /></Field>
          <Field label="Email"><Input name="email" type="email" placeholder="name@email.com" /></Field>
          <Field label="Date of birth"><Input name="birthDate" type="date" /></Field>
          <Field label="Gender"><select name="gender" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-600"><option value="">Select gender</option><option value="FEMALE">Female</option><option value="MALE">Male</option><option value="NON_BINARY">Non-binary</option><option value="UNDISCLOSED">Prefer not to say</option></select></Field>
          <Field label="Senior Citizen / PWD ID" className="sm:col-span-2"><Input name="seniorPwdId" placeholder="Optional ID number" /></Field>
          <Field label="Allergies" className="sm:col-span-2"><Input name="allergies" placeholder="Separate entries with commas" /></Field>
          {error && <p className="sm:col-span-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <div className="mt-2 flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={busy}>{busy ? "Saving…" : "Save patient"}</Button></div>
        </form>
      </section>
    </div>}
  </>;
}
