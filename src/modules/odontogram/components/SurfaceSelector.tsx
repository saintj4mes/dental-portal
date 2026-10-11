"use client";

import type { SurfaceCondition, ToothSurface } from "../types";

const options: Array<{ value: SurfaceCondition; label: string; swatch: string }> = [
  { value: "SOUND", label: "Sound", swatch: "bg-slate-100" }, { value: "CARIES", label: "Active caries", swatch: "bg-rose-300" },
  { value: "COMPOSITE", label: "Composite", swatch: "bg-blue-400" }, { value: "AMALGAM", label: "Amalgam", swatch: "bg-blue-600" },
  { value: "SEALANT", label: "Sealant", swatch: "bg-sky-200" }, { value: "CROWN", label: "Crown", swatch: "bg-amber-300" }, { value: "PLANNED", label: "Planned", swatch: "bg-emerald-300" },
];

export function SurfaceSelector({ toothNumber, surface, value, onSelect }: { toothNumber: number; surface: ToothSurface; value: SurfaceCondition; onSelect: (value: SurfaceCondition) => void }) {
  return <label className="flex items-center gap-2 text-xs text-slate-600"><span>#{toothNumber} · {surface}</span><select value={value} onChange={(event) => onSelect(event.target.value as SurfaceCondition)} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-sky-700">
    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select></label>;
}
