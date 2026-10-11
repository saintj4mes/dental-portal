import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "icon";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return <button ref={ref} className={cn("inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50", {
    "bg-sky-500 text-white hover:bg-sky-600": variant === "primary",
    "bg-white text-slate-700 ring-1 ring-[var(--color-border)] hover:bg-[#faf9f7]": variant === "secondary" || variant === "outline",
    "text-slate-500 hover:bg-slate-100 hover:text-slate-800": variant === "ghost",
    "h-9 px-3 text-sm": size === "sm", "h-10 px-4 text-sm": size === "md", "h-9 w-9": size === "icon",
  }, className)} {...props} />;
});
