"use client";

import type { ToothChartTag } from "../types";

const tagColors: Record<ToothChartTag, string | null> = {
  HEALTHY: null,
  CARIES: "#ef4444",
  COMPOSITE: "#3b82f6",
  CROWN: "#eab308",
  ROOT_CANAL: "#ec4899",
  MISSING: "#9ca3af",
};

function toothImage(number: number) {
  const quadrant = Math.floor(number / 10);
  const position = number % 10;
  const pediatric = quadrant >= 5;
  const lowerJaw = [3, 4, 7, 8].includes(quadrant);
  const type = position <= 2 ? "incisor"
    : position === 3 ? "canine"
      : pediatric || position >= 6 ? lowerJaw ? "molar-lower" : "molar"
        : position === 4 && !lowerJaw ? "premolar" : "premolar-single";
  return `/images/odontogram/tooth-${type}.png`;
}

export function ToothCell({ number, tag, selected, onSelect }: {
  number: number;
  tag: ToothChartTag;
  selected: boolean;
  onSelect: (number: number) => void;
}) {
  const lowerJaw = [3, 4, 7, 8].includes(Math.floor(number / 10));
  const transform = lowerJaw ? "translate(0 76) scale(1 -1)" : undefined;
  const missing = tag === "MISSING";

  return <button type="button" onClick={() => onSelect(number)} className="flex w-[50px] shrink-0 snap-start flex-col items-center gap-0.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" aria-label={`Select tooth ${number}, ${tag.replaceAll("_", " ").toLowerCase()}`} aria-pressed={selected}>
    <span className="block h-[62px] w-[49px] overflow-hidden">
      <svg viewBox="0 0 60 76" role="img" aria-hidden="true" className={`h-full w-full overflow-visible transition duration-150 ${missing ? "opacity-40 grayscale" : "hover:-translate-y-0.5"}`} style={{ filter: "drop-shadow(0 2px 1px rgb(93 75 44 / 13%))" }}>
        <g transform={transform}>
          <image href={toothImage(number)} x="7" y="2" width="46" height="70" preserveAspectRatio="xMidYMid meet" style={{ filter: tag === "CROWN" ? "sepia(1) saturate(2.5) hue-rotate(350deg) brightness(.9)" : undefined }} />
          {tag === "ROOT_CANAL" && <path d="M30 8 C29 20 31 31 30 47" fill="none" stroke="#be185d" strokeWidth="2.4" strokeLinecap="round" pointerEvents="none" />}
          {tagColors[tag] && tag !== "CROWN" && !missing && <g pointerEvents="none"><circle cx="30" cy="53" r="5" fill="white" opacity=".96" /><circle cx="30" cy="53" r="3.6" fill={tagColors[tag] ?? "transparent"} /></g>}
          {missing && <path d="M18 20L42 62M42 20L18 62" stroke="#64748b" strokeWidth="3" strokeLinecap="round" opacity=".82" pointerEvents="none" />}
          {selected && <rect x="6" y="3" width="48" height="69" rx="12" fill="none" stroke="#3b82f6" strokeWidth="2" pointerEvents="none" />}
        </g>
      </svg>
    </span>
    <span className={`text-[9px] font-semibold tabular-nums ${selected ? "text-sky-800" : "text-slate-500"}`}>{number}</span>
  </button>;
}
