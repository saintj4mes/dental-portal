"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { acceptTreatmentBudget } from "../actions/budgets";
import { Button } from "@/shared/components/ui/button";

export function PublicBudgetAcceptance({ token, status, patientName }: { token: string; status: string; patientName: string }) {
  const [pending, startTransition] = useTransition(); const [message, setMessage] = useState("");
  function submit(formData: FormData) { setMessage(""); const acceptedBy = String(formData.get("acceptedBy") ?? ""); startTransition(async () => { const response = await acceptTreatmentBudget({ token, acceptedBy }); setMessage(response.success ? "Your approval has been recorded." : response.error); }); }
  if (status !== "PRESENTED") return <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600">This estimate is {status.toLowerCase().replaceAll("_", " ")} and cannot receive a new approval.</p>;
  return <form action={submit} className="space-y-3"><label className="grid gap-1 text-xs font-medium text-slate-600">Patient or authorized representative name<input name="acceptedBy" required minLength={2} maxLength={180} defaultValue={patientName} className="h-10 rounded-lg border border-slate-200 px-3 outline-none focus:border-sky-500" /></label>{message && <p role="status" className="text-xs text-slate-600">{message}</p>}<Button disabled={pending}><CheckCircle2 size={15} /> {pending ? "Recording…" : "Approve treatment estimate"}</Button></form>;
}
