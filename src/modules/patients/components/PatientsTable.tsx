"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { initials } from "@/shared/lib/formatters";
import type { PatientListItem } from "../types";

export function PatientsTable({ patients }: { patients: PatientListItem[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => patients.filter((patient) => `${patient.name} ${patient.mobileNumber} ${patient.email ?? ""}`.toLowerCase().includes(query.toLowerCase())), [patients, query]);
  return <div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><label className="relative w-full max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, mobile or email" className="pl-9" /></label><button className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"><SlidersHorizontal size={15} /> Filters</button></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-y border-slate-100 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Patient</th><th className="px-4 py-3">Mobile / email</th><th className="px-4 py-3">Last visit</th><th className="px-4 py-3">Next appointment</th><th className="px-4 py-3">Notes</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((patient, index) => <tr key={patient.id} className="group hover:bg-slate-50/70"><td className="px-5 py-3.5"><Link href={`/patients/${patient.id}`} className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-full text-[10px] font-bold ${index % 3 === 0 ? "bg-[#e0f0ec] text-sky-800" : index % 3 === 1 ? "bg-[#e7edf8] text-[#546786]" : "bg-[#f6ecdf] text-[#956a3d]"}`}>{initials(patient.name)}</span><span className="text-xs font-semibold text-slate-800 group-hover:text-sky-800">{patient.name}</span></Link></td><td className="px-4 py-3.5"><p className="text-xs font-medium text-slate-700">{patient.mobileNumber}</p><p className="mt-1 text-[10px] text-slate-400">{patient.email ?? "—"}</p></td><td className="px-4 py-3.5 text-xs text-slate-600">{patient.lastVisit ?? "—"}</td><td className="px-4 py-3.5">{patient.nextAppointment ? <span className="text-xs text-slate-700">{patient.nextAppointment}</span> : <span className="text-xs text-slate-400">Not scheduled</span>}</td><td className="px-4 py-3.5"><div className="flex flex-wrap gap-1">{patient.alerts.map((alert) => <Badge key={alert} tone="amber">{alert}</Badge>)}{patient.seniorPwd && <Badge tone="blue">SC / PWD</Badge>}{patient.alerts.length === 0 && !patient.seniorPwd && <span className="text-xs text-slate-300">—</span>}</div></td><td className="px-4 py-3.5"><Link href={`/patients/${patient.id}`} className="text-xs font-semibold text-sky-800 opacity-0 transition group-hover:opacity-100">View</Link></td></tr>)}</tbody></table></div>
    {filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-500">No patients match “{query}”.</div>}
  </div>;
}
