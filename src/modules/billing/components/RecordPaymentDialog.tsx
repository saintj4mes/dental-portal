"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, X } from "lucide-react";
import { recordPayment } from "../actions/payments";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { formatPHP } from "@/shared/lib/formatters";

export function RecordPaymentDialog({ invoiceId, amountDue }: { invoiceId: string; amountDue: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false); const [error, setError] = useState(""); const [receipt, setReceipt] = useState(""); const [busy, startTransition] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const data = { invoiceId, amount: Number(form.get("amount")), method: String(form.get("method")), referenceNumber: String(form.get("referenceNumber") ?? "") }; startTransition(async () => { const result = await recordPayment(data); if (!result.success) setError(result.error); else { setReceipt(result.data.orNumber); setError(""); router.refresh(); } }); }
  return <><button onClick={() => { setOpen(true); setReceipt(""); }} className="text-xs font-semibold text-sky-800 hover:text-sky-950">Record payment</button>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4"><section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex justify-between"><div><h2 className="text-lg font-semibold">Record payment</h2><p className="mt-1 text-sm text-slate-500">Balance due: {formatPHP(amountDue)}</p></div><button onClick={() => setOpen(false)} className="text-slate-400"><X size={18} /></button></div>{receipt ? <div className="rounded-xl bg-emerald-50 p-4 text-center"><div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-white text-emerald-700"><ArrowDownToLine size={16} /></div><p className="mt-3 text-sm font-semibold text-emerald-900">Payment recorded</p><p className="mt-1 text-xs text-emerald-800">Official Receipt {receipt}</p><Button className="mt-4 w-full" onClick={() => setOpen(false)}>Done</Button></div> : <form onSubmit={submit} className="grid gap-4"><Field label="Amount received"><Input name="amount" type="number" min="0.01" max={amountDue} step="0.01" defaultValue={amountDue} required /></Field><Field label="Payment method"><select name="method" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="CASH">Cash</option><option value="GCASH">GCash</option><option value="MAYA">Maya</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CARD">Card</option></select></Field><Field label="Reference number"><Input name="referenceNumber" placeholder="Optional for digital payments" /></Field>{error && <p className="text-xs text-rose-700">{error}</p>}<Button disabled={busy}>{busy ? "Saving…" : "Save payment"}</Button></form>}</section></div>}</>;
}
