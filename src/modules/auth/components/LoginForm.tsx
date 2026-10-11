"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Eye, EyeOff } from "lucide-react";
import { login } from "../actions/login";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

export function LoginForm() {
  const router = useRouter(); const [showPassword, setShowPassword] = useState(false); const [error, setError] = useState(""); const [busy, startTransition] = useTransition();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    startTransition(async () => { const result = await login({ email: form.get("email"), password: form.get("password") }); if (!result.success) { setError(result.error); return; } router.replace(result.data.redirectTo); router.refresh(); });
  }
  return <section className="w-full max-w-[410px] rounded-3xl border border-slate-200/70 bg-white p-8 shadow-[0_24px_70px_rgba(35,67,74,.09)]"><div className="mb-8 text-center"><span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-sky-700 text-white"><Activity size={23} /></span><h1 className="text-xl font-bold tracking-tight">dental<span className="text-sky-700">pin</span></h1><p className="mt-2 text-sm text-slate-500">Sign in to your clinic workspace</p></div><form onSubmit={submit} className="space-y-4"><Field label="Work email"><Input required name="email" type="email" autoComplete="username" placeholder="you@clinic.com" /></Field><Field label="Password"><div className="relative"><Input required name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" className="pr-11" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></Field>{error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}<Button className="mt-2 w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button></form><p className="mt-6 text-center text-[11px] leading-5 text-slate-400">Need access? Ask your clinic administrator to set up your account.</p><p className="mt-4 border-t border-slate-100 pt-4 text-center text-xs"><Link href="/demo" className="font-semibold text-sky-700 hover:text-sky-900">Explore the interactive demo <span aria-hidden="true">→</span></Link></p></section>;
}
