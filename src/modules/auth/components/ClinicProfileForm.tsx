"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { updateClinic } from "../actions/clinic";

export interface ClinicProfile { name: string; taxId: string; address: string; contactNumber: string; officialReceiptPrefix: string; isVatRegistered: boolean; }
export function ClinicProfileForm({ clinic }: { clinic: ClinicProfile }) {
  const [editing, setEditing] = useState(false); const [error, setError] = useState(""); const [busy, startTransition] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const values = new FormData(event.currentTarget); const input = { name: String(values.get("name")), taxId: String(values.get("taxId")), address: String(values.get("address")), contactNumber: String(values.get("contactNumber")), officialReceiptPrefix: String(values.get("officialReceiptPrefix")), isVatRegistered: values.get("isVatRegistered") === "on" }; startTransition(async () => { const result = await updateClinic(input); if (!result.success) setError(result.error); else { setEditing(false); setError(""); } }); }
  return <form onSubmit={submit}><div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{editing ? <>
    <Field label="Clinic name"><Input name="name" defaultValue={clinic.name} required /></Field><Field label="BIR TIN"><Input name="taxId" defaultValue={clinic.taxId} /></Field><Field label="Contact number"><Input name="contactNumber" defaultValue={clinic.contactNumber} /></Field><Field label="Official Receipt prefix"><Input name="officialReceiptPrefix" defaultValue={clinic.officialReceiptPrefix} required maxLength={12} /></Field><Field label="Clinic address" className="sm:col-span-2"><Input name="address" defaultValue={clinic.address} /></Field><label className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:col-span-2"><input type="checkbox" name="isVatRegistered" defaultChecked={clinic.isVatRegistered} className="h-4 w-4 accent-sky-700" /> Clinic is VAT registered</label>
  </> : [["Clinic name", clinic.name], ["BIR TIN", clinic.taxId], ["Contact number", clinic.contactNumber], ["Address", clinic.address]].map(([label, value]) => <div key={label}><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1.5 text-xs font-medium text-slate-700">{value || "Not provided"}</p></div>)}</div>
    {error && <p className="mt-3 text-xs text-rose-700">{error}</p>}<div className="mt-5 flex gap-2">{editing ? <><Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button><Button disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button></> : <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit clinic profile</Button>}</div>
  </form>;
}
