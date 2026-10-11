"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { saveChair } from "../actions/appointments";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export function ChairSettings({ chairs }: { chairs: Array<{ id: string; name: string; isActive: boolean }> }) {
  const [open, setOpen] = useState(false); const [error, setError] = useState(""); const [busy, startTransition] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const name = String(new FormData(event.currentTarget).get("name") ?? ""); startTransition(async () => { const result = await saveChair({ name, isActive: true }); if (!result.success) setError(result.error); else { setOpen(false); setError(""); } }); }
  return <div><div className="divide-y divide-slate-100">{chairs.map((chair) => <div key={chair.id} className="flex items-center justify-between py-3"><div><p className="text-xs font-semibold">{chair.name}</p><p className="mt-1 text-[10px] text-slate-400">Operatory chair</p></div><span className={`flex items-center gap-1.5 text-[10px] font-medium ${chair.isActive ? "text-emerald-700" : "text-slate-400"}`}><span className={`h-1.5 w-1.5 rounded-full ${chair.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />{chair.isActive ? "Active" : "Inactive"}</span></div>)}</div><button onClick={() => setOpen(true)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-800"><Plus size={14} /> Add operatory</button>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4"><form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"><div className="mb-4 flex justify-between"><h3 className="font-semibold">Add operatory</h3><button type="button" onClick={() => setOpen(false)}><X size={17} /></button></div><Input name="name" required placeholder="e.g. Operatory 3" />{error && <p className="mt-2 text-xs text-rose-700">{error}</p>}<Button disabled={busy} className="mt-4 w-full">{busy ? "Saving…" : "Save operatory"}</Button></form></div>}</div>;
}
