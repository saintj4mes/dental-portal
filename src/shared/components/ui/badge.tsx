import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export function Badge({ className, tone = "neutral", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "green" | "blue" | "amber" | "red" }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", {
    "bg-slate-100 text-slate-600": tone === "neutral", "bg-emerald-50 text-emerald-700": tone === "green",
    "bg-blue-50 text-blue-700": tone === "blue", "bg-amber-50 text-amber-700": tone === "amber", "bg-rose-50 text-rose-700": tone === "red",
  }, className)} {...props} />;
}
