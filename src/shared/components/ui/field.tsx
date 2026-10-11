import type { ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return <label className={cn("grid gap-1.5", className)}><span className="text-xs font-semibold text-slate-600">{label}</span>{children}{hint && <span className="text-[11px] text-slate-400">{hint}</span>}</label>;
}
export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("min-h-24 w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100", props.className)} />;
}
