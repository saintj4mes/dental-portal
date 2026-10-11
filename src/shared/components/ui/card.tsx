import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-[var(--color-border)] bg-white shadow-[0_1px_2px_rgba(15,17,22,0.03)]", className)} {...props} />;
}
