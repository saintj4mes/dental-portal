"use client";

import { useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Activity, Save } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { createPeriodontalExam, savePeriodontalChart } from "../actions/periodontal-exams";

const sites = ["MB", "B", "DB", "ML", "L", "DL"] as const;
const quadrants = [
  { label: "Upper right · Q1", teeth: [18, 17, 16, 15, 14, 13, 12, 11] },
  { label: "Upper left · Q2", teeth: [21, 22, 23, 24, 25, 26, 27, 28] },
  { label: "Lower right · Q4", teeth: [48, 47, 46, 45, 44, 43, 42, 41] },
  { label: "Lower left · Q3", teeth: [31, 32, 33, 34, 35, 36, 37, 38] },
];

export interface PeriodontalValue { toothNumber: number; site: string; pocketDepth: number; recession: number; bleeding: boolean; suppuration: boolean; mobility: number; furcation: number }

export function PeriodontalChartEditor({ patientId, examId, notes, values }: { patientId: string; examId: string | null; notes: string; values: PeriodontalValue[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function createExam() {
    startTransition(async () => {
      const result = await createPeriodontalExam({ patientId });
      if (result.success) router.push(`/patients/${patientId}/periodontogram?exam=${result.data.id}`);
    });
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!examId) return;
    const data = new FormData(event.currentTarget);
    const measurements = quadrants.flatMap((quadrant) => quadrant.teeth.flatMap((toothNumber) => sites.map((site) => ({
      toothNumber,
      site,
      pocketDepth: Number(data.get(`pd-${toothNumber}-${site}`) ?? 0),
      recession: Number(data.get(`rec-${toothNumber}-${site}`) ?? 0),
      bleeding: data.get(`bop-${toothNumber}-${site}`) === "on",
      suppuration: data.get(`sup-${toothNumber}-${site}`) === "on",
      mobility: Number(data.get(`mob-${toothNumber}`) ?? 0),
      furcation: Number(data.get(`fur-${toothNumber}`) ?? 0),
    }))));
    startTransition(async () => {
      const result = await savePeriodontalChart({ examId, measurements, notes: String(data.get("notes") ?? "") });
      if (result.success) router.refresh();
    });
  }
  if (!examId) return <Card className="p-8 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-sky-50 text-sky-700"><Activity size={20} /></span><h2 className="mt-3 text-sm font-semibold text-slate-900">No periodontal exams yet</h2><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#94908a]">Create an exam to chart probing depths, bleeding, suppuration, mobility, and furcation at six sites per FDI tooth.</p><Button className="mt-4" size="sm" onClick={createExam} disabled={pending}>{pending ? "Creating…" : "Start periodontal exam"}</Button></Card>;

  const valueBySite = new Map(values.map((value) => [`${value.toothNumber}-${value.site}`, value]));
  const sharedButton = <Button type="submit" size="sm" disabled={pending}><Save size={14} /> {pending ? "Saving chart…" : "Save periodontal chart"}</Button>;
  return <form onSubmit={submit} className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-[#94908a]">Enter probing depth and recession in millimeters. Select BOP or suppuration where present.</p><div className="mt-2 flex flex-wrap gap-3 text-[10px] text-[#615d59]"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />0–3 mm</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500" />4–5 mm</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />6+ mm</span></div></div>{sharedButton}</div>
    {quadrants.map((quadrant) => <Card key={quadrant.label} className="overflow-hidden"><div className="border-b border-[var(--color-border-subtle)] bg-[#fbfaf8] px-4 py-3"><h2 className="text-xs font-semibold text-slate-900">{quadrant.label}</h2></div><div className="overflow-x-auto"><div className="grid min-w-[1120px] grid-cols-8 divide-x divide-black/[0.05]">{quadrant.teeth.map((toothNumber) => <div key={toothNumber} className="px-2 py-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold tabular-nums text-slate-900">{toothNumber}</span><span className="text-[9px] text-[#94908a]">FDI</span></div><div className="space-y-2">{sites.map((site) => { const key = `${toothNumber}-${site}`; const value = valueBySite.get(key); const color = (value?.pocketDepth ?? 0) >= 6 ? "border-red-300 bg-red-50" : (value?.pocketDepth ?? 0) >= 4 ? "border-amber-300 bg-amber-50" : "border-[var(--color-border)] bg-white"; return <div key={site} className="flex items-center gap-1"><span className="w-6 text-[9px] font-medium text-[#615d59]">{site}</span><input aria-label={`Tooth ${toothNumber} ${site} probing depth, millimeters`} name={`pd-${toothNumber}-${site}`} type="number" min="0" max="15" defaultValue={value?.pocketDepth ?? 0} className={`h-7 w-10 rounded border text-center text-[11px] tabular-nums outline-none focus:border-sky-500 ${color}`} /><input aria-label={`Tooth ${toothNumber} ${site} recession, millimeters`} name={`rec-${toothNumber}-${site}`} type="number" min="0" max="15" defaultValue={value?.recession ?? 0} className="h-7 w-9 rounded border border-[var(--color-border)] text-center text-[10px] tabular-nums outline-none focus:border-sky-500" /><label title="Bleeding on probing" className="grid h-6 w-5 cursor-pointer place-items-center rounded bg-rose-50 text-[9px] font-bold text-rose-700"><input aria-label={`Tooth ${toothNumber} ${site} bleeding on probing`} name={`bop-${toothNumber}-${site}`} type="checkbox" defaultChecked={value?.bleeding ?? false} className="sr-only peer" /><span className="peer-checked:hidden">B</span><span className="hidden peer-checked:inline">●</span></label><label title="Suppuration" className="grid h-6 w-5 cursor-pointer place-items-center rounded bg-amber-50 text-[9px] font-bold text-amber-700"><input aria-label={`Tooth ${toothNumber} ${site} suppuration`} name={`sup-${toothNumber}-${site}`} type="checkbox" defaultChecked={value?.suppuration ?? false} className="sr-only peer" /><span className="peer-checked:hidden">S</span><span className="hidden peer-checked:inline">●</span></label></div>; })}</div><div className="mt-3 border-t border-black/[0.05] pt-2"><label className="block text-[9px] text-[#94908a]">Mobility</label><select name={`mob-${toothNumber}`} defaultValue={valueBySite.get(`${toothNumber}-B`)?.mobility ?? 0} className="mt-1 h-7 w-full rounded border border-[var(--color-border)] bg-white text-center text-[10px]"><option value="0">0</option><option value="1">I</option><option value="2">II</option><option value="3">III</option></select><label className="mt-2 block text-[9px] text-[#94908a]">Furcation</label><select name={`fur-${toothNumber}`} defaultValue={valueBySite.get(`${toothNumber}-B`)?.furcation ?? 0} className="mt-1 h-7 w-full rounded border border-[var(--color-border)] bg-white text-center text-[10px]"><option value="0">0</option><option value="1">I</option><option value="2">II</option><option value="3">III</option></select></div></div>)}</div></div><div className="grid grid-cols-2 border-t border-[var(--color-border-subtle)] bg-[#fbfaf8] px-4 py-2 text-[9px] font-semibold uppercase text-[#94908a]"><span>Site: MB · B · DB · ML · L · DL</span><span>PD / recession (mm) · BOP · Suppuration</span></div></Card>)}
    <Card className="p-4"><label className="block text-xs font-medium text-[#615d59]">Exam notes<textarea name="notes" defaultValue={notes} maxLength={2000} rows={3} className="mt-1.5 w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-xs" placeholder="Clinical observations, indices, and follow-up recommendations" /></label><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-[10px] text-[#94908a]">B marks bleeding on probing; S marks suppuration. Changes save as one exam snapshot.</p>{sharedButton}</div></Card>
  </form>;
}
