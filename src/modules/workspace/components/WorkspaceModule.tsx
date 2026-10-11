"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Check, CircleAlert, Plus, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { createWorkspaceRecord, updateWorkspaceRecordStatus } from "../actions/records";
import { workspaceModules, type WorkspaceModuleKey } from "@/shared/lib/workspace-modules";
import { formatPHP } from "@/shared/lib/formatters";

export interface WorkspaceRecordView {
  id: string;
  title: string;
  details: string | null;
  reference: string | null;
  status: string;
  amount: number | null;
  dueAt: string | null;
  createdAt: string;
}

export function WorkspaceModule({ module, records }: { module: WorkspaceModuleKey; records: WorkspaceRecordView[] }) {
  const config = workspaceModules[module];
  const Icon = config.icon;
  const [query, setQuery] = useState("");
  const openCount = records.filter((record) => !["DONE", "COMPLETED", "CANCELLED", "ARCHIVED", "VOID", "CONVERTED", "DECLINED", "DISPENSED", "RECEIVED", "SIGNED", "REIMBURSED", "REVIEWED"].includes(record.status)).length;
  const filtered = records.filter((record) => `${record.title} ${record.reference ?? ""} ${record.details ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="mb-2 flex items-center gap-2 text-xs text-[#94908a]"><span>Workspace</span><span>/</span><span className="text-[#615d59]">{config.title}</span></div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-700"><Icon size={20} /></span><div><h1 className="text-[24px] font-semibold tracking-tight text-slate-900">{config.title}</h1><p className="mt-1 text-[13px] text-[#615d59]">{config.description}</p></div></div></div>
      <CreateRecordForm module={module} />
    </header>
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryCard label={`Total ${config.itemLabel}s`} value={String(records.length)} note="All records in this clinic" />
      <SummaryCard label="Open items" value={String(openCount)} note="Needs follow-up or action" />
      <SummaryCard label="Scheduled dates" value={String(records.filter((record) => record.dueAt).length)} note="Records with a date" />
    </div>
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-4 py-3.5 sm:px-5">
        <div><h2 className="text-sm font-semibold text-slate-900">All {config.itemLabel}s</h2><p className="mt-0.5 text-xs text-[#94908a]">Clinic records with status and follow-up details</p></div>
        <label className="flex h-8 w-full max-w-[240px] items-center gap-2 rounded-md bg-[#f4f2ef] px-2.5 text-[#94908a]"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-[#94908a]" placeholder={`Search ${config.itemLabel}s`} /></label>
      </div>
      {filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-[13px]"><thead className="bg-[#fbfaf8] text-[10px] font-semibold uppercase tracking-wide text-[#94908a]"><tr><th className="px-5 py-3">Name / Details</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-black/[0.05]">{filtered.map((record) => <RecordRow key={record.id} module={module} record={record} />)}</tbody></table></div> : <div className="px-5 py-16 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-[#f4f2ef] text-[#615d59]"><Icon size={18} /></span><h3 className="mt-3 text-sm font-semibold text-slate-900">{query ? "No matching records" : `No ${config.itemLabel}s yet`}</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#94908a]">{query ? "Try another name or reference." : `Start tracking ${config.itemLabel}s here. New records are saved to this clinic and can be updated by your team.`}</p>{!query && <div className="mt-4"><CreateRecordForm module={module} compact /></div>}</div>}
      <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] px-5 py-3 text-[11px] text-[#94908a]"><span>Showing {filtered.length} of {records.length}</span><span className="flex items-center gap-1"><CircleAlert size={12} /> Keep patient identifiers to the minimum needed</span></div>
    </Card>
  </div>;
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }) {
  return <Card className="p-4"><p className="text-xs font-medium text-[#615d59]">{label}</p><p className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-[11px] text-[#94908a]">{note}</p></Card>;
}

function CreateRecordForm({ module, compact = false }: { module: WorkspaceModuleKey; compact?: boolean }) {
  const config = workspaceModules[module];
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const amountString = String(form.get("amount") ?? "");
    const result = createWorkspaceRecord({
      module, title: form.get("title"), details: form.get("details"), reference: form.get("reference"),
      status: form.get("status"), dueAt: form.get("dueAt"), amount: amountString ? Number(amountString) : undefined,
    });
    startTransition(async () => {
      const response = await result;
      if (!response.success) { setError(response.error); return; }
      setOpen(false);
      router.refresh();
    });
  }
  if (!open) return <Button size="sm" onClick={() => setOpen(true)}><Plus size={15} /> {config.createLabel}</Button>;
  return <div className={compact ? "mx-auto max-w-xl text-left" : "fixed inset-0 z-50 grid place-items-center bg-slate-950/25 p-4"}>
    <div className={compact ? "rounded-lg border border-[var(--color-border)] bg-white p-4" : "w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-xl"}>
      <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-slate-900">{config.createLabel}</h2><p className="mt-1 text-xs text-[#615d59]">Add a record to the clinic workspace.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-xs text-[#615d59] hover:bg-[#f4f2ef]">Close</button></div>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-medium text-[#615d59] sm:col-span-2">Name / title<input name="title" required minLength={2} maxLength={180} className="h-9 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label>
        <label className="space-y-1 text-xs font-medium text-[#615d59]">{config.referenceLabel}<input name="reference" maxLength={100} className="h-9 w-full rounded-md border border-[var(--color-border)] px-3 text-sm text-slate-900 outline-none focus:border-sky-500" /></label>
        <label className="space-y-1 text-xs font-medium text-[#615d59]">Status<select name="status" defaultValue={config.initialStatus} className="h-9 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm text-slate-900">{config.statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label>
        <label className="space-y-1 text-xs font-medium text-[#615d59]">{config.dueLabel}<span className="relative block"><CalendarDays size={14} className="absolute left-3 top-3 text-[#94908a]" /><input name="dueAt" type="date" className="h-9 w-full rounded-md border border-[var(--color-border)] pl-9 pr-3 text-sm text-slate-900" /></span></label>
        <label className="space-y-1 text-xs font-medium text-[#615d59]">Amount (₱)<input name="amount" type="number" min="0" step="0.01" className="h-9 w-full rounded-md border border-[var(--color-border)] px-3 text-sm text-slate-900" /></label>
        <label className="space-y-1 text-xs font-medium text-[#615d59] sm:col-span-2">Notes<textarea name="details" rows={3} maxLength={2000} className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500" /></label>
        {error && <p role="alert" className="text-xs text-red-700 sm:col-span-2">{error}</p>}
        <div className="flex justify-end gap-2 pt-1 sm:col-span-2"><Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : <><Check size={14} /> Save record <ArrowRight size={13} /></>}</Button></div>
      </form>
    </div>
  </div>;
}

function RecordRow({ module, record }: { module: WorkspaceModuleKey; record: WorkspaceRecordView }) {
  const config = workspaceModules[module];
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const statuses: readonly string[] = config.statuses;
  const statusIndex = statuses.indexOf(record.status);
  const nextStatus = (statusIndex >= 0 ? statuses[(statusIndex + 1) % statuses.length] : config.initialStatus) ?? config.initialStatus;
  return <tr className="group hover:bg-[#fbfaf8]">
    <td className="max-w-[360px] px-5 py-3"><p className="truncate font-medium text-slate-900">{record.title}</p>{record.details && <p className="mt-1 truncate text-[11px] text-[#94908a]">{record.details}</p>}</td>
    <td className="px-4 py-3 text-xs text-[#615d59]">{record.reference || "—"}</td>
    <td className="px-4 py-3"><button type="button" disabled={pending} title={`Move to ${nextStatus.replaceAll("_", " ")}`} onClick={() => startTransition(async () => { const response = await updateWorkspaceRecordStatus({ id: record.id, module, status: nextStatus }); if (response.success) router.refresh(); })} className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-50">{record.status.replaceAll("_", " ")} <span aria-hidden="true">→</span></button></td>
    <td className="whitespace-nowrap px-4 py-3 text-xs text-[#615d59]">{record.dueAt ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" }).format(new Date(`${record.dueAt}T00:00:00+08:00`)) : "—"}</td>
    <td className="whitespace-nowrap px-4 py-3 text-right text-xs tabular-nums text-slate-800">{record.amount === null ? "—" : formatPHP(record.amount)}</td>
    <td className="px-3 py-3 text-right"><span className="text-[#94908a] opacity-0 transition group-hover:opacity-100"><ArrowRight size={14} /></span></td>
  </tr>;
}
