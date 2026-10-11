"use client";

import { useState, useTransition } from "react";
import { Baby, RotateCcw, Save } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { saveToothState } from "../actions/teeth";
import { healthySurfaces, type SurfaceCondition, type ToothChartTag, type ToothOverallStatus, type ToothSurfaceMap } from "../types";
import { ToothCell } from "./ToothCell";

export interface ToothRecordView { toothNumber: number; overallStatus: ToothOverallStatus; surfaces: ToothSurfaceMap; }

const chartTags: Array<{ value: ToothChartTag; label: string; dot: string }> = [
  { value: "HEALTHY", label: "Healthy", dot: "bg-emerald-500" },
  { value: "CARIES", label: "Caries", dot: "bg-red-500" },
  { value: "COMPOSITE", label: "Composite", dot: "bg-blue-500" },
  { value: "CROWN", label: "Crown", dot: "bg-amber-500" },
  { value: "ROOT_CANAL", label: "Root canal", dot: "bg-pink-500" },
  { value: "MISSING", label: "Missing", dot: "bg-slate-400" },
];

function teethFor(pediatric: boolean): number[][] {
  // Dentist's view: the patient's right quadrants are on the left side of the chart.
  const first = pediatric ? 55 : 18; const q1 = Array.from({ length: pediatric ? 5 : 8 }, (_, i) => first - i);
  const second = pediatric ? 61 : 21; const q2 = Array.from({ length: pediatric ? 5 : 8 }, (_, i) => second + i);
  const third = pediatric ? 71 : 31; const q3 = Array.from({ length: pediatric ? 5 : 8 }, (_, i) => third + i);
  const fourth = pediatric ? 85 : 48; const q4 = Array.from({ length: pediatric ? 5 : 8 }, (_, i) => fourth - i);
  return [q1, q2, q3, q4];
}

function getToothTag(record?: ToothRecordView): ToothChartTag {
  if (!record) return "HEALTHY";
  if (record.overallStatus === "MISSING") return "MISSING";
  if (record.overallStatus === "ENDO_TREATED") return "ROOT_CANAL";
  if (record.overallStatus === "CROWN" || record.surfaces.occlusal === "CROWN") return "CROWN";
  if (Object.values(record.surfaces).some((condition) => condition === "CARIES")) return "CARIES";
  if (Object.values(record.surfaces).some((condition) => condition === "COMPOSITE" || condition === "AMALGAM")) return "COMPOSITE";
  return "HEALTHY";
}

function tagRecord(toothNumber: number, tag: ToothChartTag): ToothRecordView {
  const condition: SurfaceCondition = tag === "CARIES" ? "CARIES" : tag === "COMPOSITE" ? "COMPOSITE" : tag === "CROWN" ? "CROWN" : "SOUND";
  const surfaces = Object.fromEntries(Object.keys(healthySurfaces).map((key) => [key, condition])) as ToothSurfaceMap;
  const status: ToothOverallStatus = tag === "MISSING" ? "MISSING" : tag === "CROWN" ? "CROWN" : tag === "ROOT_CANAL" ? "ENDO_TREATED" : "HEALTHY";
  return { toothNumber, overallStatus: status, surfaces: tag === "HEALTHY" ? { ...healthySurfaces } : surfaces };
}

export function OdontogramChart({ patientId, initialRecords = [] }: { patientId: string; initialRecords?: ToothRecordView[] }) {
  const [pediatric, setPediatric] = useState(false);
  const [records, setRecords] = useState<Map<number, ToothRecordView>>(() => new Map(initialRecords.map((record) => [record.toothNumber, record])));
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, startTransition] = useTransition();
  const rows = teethFor(pediatric);
  const allTeeth = rows.flat();
  const selectedTag = selectedTooth === null ? null : getToothTag(records.get(selectedTooth));

  function updateTag(toothNumber: number, tag: ToothChartTag) {
    setRecords((current) => {
      const next = new Map(current);
      next.set(toothNumber, tagRecord(toothNumber, tag));
      return next;
    });
    setNotice("");
  }

  function save() {
    if (selectedTooth === null) { setNotice("Select a tooth to save an update."); return; }
    const record = records.get(selectedTooth);
    if (!record) return;
    startTransition(async () => {
      const result = await saveToothState({ patientId, toothNumber: record.toothNumber, overallStatus: record.overallStatus, surfaces: record.surfaces });
      setNotice(result.success ? `Tooth ${record.toothNumber} updated.` : result.error);
    });
  }

  function resetSelected() {
    if (selectedTooth !== null) updateTag(selectedTooth, "HEALTHY");
  }

  return <Card className="p-5 sm:p-7">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold">Odontogram</h2>
        <p className="mt-1 text-xs text-slate-500">Tap a tooth, then choose its condition.</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => { setPediatric((value) => !value); setSelectedTooth(null); }} className={`flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-medium ring-1 transition ${pediatric ? "bg-sky-50 text-sky-800 ring-sky-200" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}><Baby size={15} />{pediatric ? "Pediatric" : "Adult teeth"}</button>
        <Button size="sm" onClick={save} disabled={busy || selectedTooth === null}><Save size={14} />{busy ? "Saving..." : "Save chart"}</Button>
      </div>
    </div>

    <div className="mb-2 flex min-h-7 items-center justify-between gap-3 text-xs">
      <p className="text-slate-600">{selectedTooth === null ? "Select a tooth to view or change its status." : <>Tooth <span className="font-semibold text-slate-800">{selectedTooth}</span> — <span className={`font-semibold ${selectedTag === "HEALTHY" ? "text-emerald-600" : "text-slate-700"}`}>{chartTags.find((item) => item.value === selectedTag)?.label}</span></>}</p>
      {selectedTooth !== null && <button type="button" onClick={resetSelected} className="inline-flex items-center gap-1 text-slate-500 transition hover:text-slate-800"><RotateCcw size={12} />Reset</button>}
    </div>

    <div className="overflow-x-auto snap-x snap-mandatory pb-3"><div className="mx-auto min-w-[690px] max-w-[850px]">
      <div className="flex w-max justify-center gap-1 border-b border-dashed border-slate-200 pb-4">{rows[0]?.map((number) => <ToothCell key={number} number={number} tag={getToothTag(records.get(number))} selected={selectedTooth === number} onSelect={(toothNumber) => { setSelectedTooth(toothNumber); setNotice(""); }} />)}<span className="w-3 shrink-0" />{rows[1]?.map((number) => <ToothCell key={number} number={number} tag={getToothTag(records.get(number))} selected={selectedTooth === number} onSelect={(toothNumber) => { setSelectedTooth(toothNumber); setNotice(""); }} />)}</div>
      <div className="mt-4 flex w-max justify-center gap-1">{rows[3]?.map((number) => <ToothCell key={number} number={number} tag={getToothTag(records.get(number))} selected={selectedTooth === number} onSelect={(toothNumber) => { setSelectedTooth(toothNumber); setNotice(""); }} />)}<span className="w-3 shrink-0" />{rows[2]?.map((number) => <ToothCell key={number} number={number} tag={getToothTag(records.get(number))} selected={selectedTooth === number} onSelect={(toothNumber) => { setSelectedTooth(toothNumber); setNotice(""); }} />)}</div>
    </div></div>

    {selectedTooth !== null && <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{chartTags.map(({ value, label, dot }) => <button key={value} type="button" onClick={() => updateTag(selectedTooth, value)} aria-pressed={selectedTag === value} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${selectedTag === value ? "border-slate-900 bg-slate-50 text-slate-950 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}><span className={`h-2.5 w-2.5 rounded-full ${dot}`} />{label}</button>)}</div>}

    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4">{chartTags.map(({ value, label, dot }) => {
      const count = allTeeth.filter((number) => getToothTag(records.get(number)) === value).length;
      return <span key={value} className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className={`h-2.5 w-2.5 rounded-full ${dot}`} />{label} <span className="tabular-nums text-slate-400">{count}</span></span>;
    })}</div>
    {notice && <p role="status" className={`mt-3 text-center text-xs ${notice.includes("updated") ? "text-emerald-700" : "text-rose-600"}`}>{notice}</p>}
  </Card>;
}
