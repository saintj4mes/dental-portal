"use client";

import { useState, useTransition, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { requestPublicBooking } from "../actions/booking";

type ServiceChoice = { name: string; price: number };
const appointmentTimes = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM"];

export function PublicBookingForm({ clinicId, clinicName, services }: { clinicId: string; clinicName: string; services: ServiceChoice[] }) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceChoice | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pending, startTransition] = useTransition();
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service || !date || !time) return;
    const form = new FormData(event.currentTarget);
    setError("");
    startTransition(async () => {
      const result = await requestPublicBooking({
        clinicId,
        patientName: form.get("patientName"),
        mobileNumber: form.get("mobileNumber"),
        email: form.get("email"),
        requestedAt: `${date}T${to24Hour(time)}`,
        reason: service.name,
        website: form.get("website"),
      });
      if (result.success) setComplete(true);
      else setError(result.error);
    });
  }

  if (complete) return <Card className="animate-[demo-in_260ms_ease-out] p-6 sm:p-8"><div className="mx-auto max-w-sm text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={23} /></span><p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700">Request sent</p><h2 className="mt-1 text-lg font-semibold text-slate-900">We’ll be in touch, soon.</h2><p className="mt-2 text-xs leading-5 text-slate-500">{clinicName} will contact you to confirm your {service?.name.toLowerCase()} request for {new Date(`${date}T${to24Hour(time)}:00+08:00`).toLocaleString("en-PH", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" })}.</p><p className="mt-5 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500">Your time is a request until the clinic confirms it. Need urgent care? Call the clinic directly.</p><button type="button" onClick={() => { setComplete(false); setStep(0); setService(null); setDate(""); setTime(""); }} className="mt-5 text-xs font-semibold text-sky-700 hover:text-sky-900">Request another appointment</button></div></Card>;

  const canContinue = step === 0 ? Boolean(service) : step === 1 ? Boolean(date && time) : true;
  return <Card className="overflow-hidden p-5 sm:p-7">
    <div className="mb-6"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-700">Patient portal · book a visit</p><h2 className="mt-1 text-base font-semibold">Request an appointment</h2></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">Step {step + 1} of 3</span></div><div className="mt-4 grid grid-cols-3 gap-1.5" aria-label={`Step ${step + 1} of 3`}>{[0, 1, 2].map((item) => <span key={item} className={`h-1 rounded-full transition-colors duration-300 ${item <= step ? "bg-sky-600" : "bg-slate-100"}`} />)}</div></div>
    {step === 0 && <div key="service" className="animate-[demo-in_260ms_ease-out]"><p className="mb-3 text-xs text-slate-500">What would you like to book?</p><div className="grid gap-2">{services.map((choice) => <button key={choice.name} type="button" onClick={() => setService(choice)} className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm ${service?.name === choice.name ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100" : "border-slate-200 bg-white"}`}><span><span className="block text-xs font-semibold text-slate-900">{choice.name}</span><span className="mt-1 block text-[10px] text-slate-500">{choice.name.toLowerCase().includes("clean") ? "30 minutes" : "30-minute visit"}</span></span><span className="flex items-center gap-2 text-xs font-semibold text-slate-800">{formatPHP(choice.price)}<span className={`grid h-4 w-4 place-items-center rounded-full border ${service?.name === choice.name ? "border-sky-600 bg-sky-600 text-white" : "border-slate-300"}`}>{service?.name === choice.name && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span></span></button>)}</div></div>}
    {step === 1 && <div key="slot" className="animate-[demo-in_260ms_ease-out]"><label className="mb-4 grid gap-2 text-xs font-medium text-slate-700"><span className="flex items-center gap-2"><CalendarDays size={14} className="text-sky-700" />Choose a date</span><input type="date" value={date} min={localDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000))} max={localDateKey(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))} onChange={(event) => { setDate(event.target.value); setTime(""); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" /></label><div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-700"><Clock3 size={14} className="text-sky-700" />Choose a preferred time</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{appointmentTimes.map((slot) => <button key={slot} type="button" onClick={() => setTime(slot)} className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition duration-200 hover:-translate-y-0.5 ${time === slot ? "border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-100" : "border-slate-200 text-slate-600 hover:border-sky-300"}`}>{slot}</button>)}</div><p className="mt-3 text-[10px] leading-4 text-slate-400">This is your preferred time. The clinic will check availability before confirming.</p></div>}
    {step === 2 && <form key="details" onSubmit={submit} className="animate-[demo-in_260ms_ease-out] space-y-3"><div className="mb-4 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-600"><span className="font-semibold text-slate-900">{service?.name}</span><span> · {date && new Date(`${date}T12:00:00`).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })} at {time}</span></div><Field label="Full name"><input name="patientName" required minLength={2} maxLength={180} autoComplete="name" className={field} /></Field><Field label="Philippine mobile number"><input name="mobileNumber" required type="tel" autoComplete="tel" placeholder="09171234567" className={field} /></Field><Field label="Email (optional)"><input name="email" type="email" autoComplete="email" className={field} /></Field><label aria-hidden="true" className="hidden">Leave this field blank<input name="website" tabIndex={-1} autoComplete="off" /></label>{error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}<Button disabled={pending} className="w-full">{pending ? "Sending request…" : <>Send booking request <ArrowRight size={14} /></>}</Button><p className="text-center text-[10px] leading-4 text-slate-400">By continuing, you allow {clinicName} to contact you about this booking request.</p></form>}
    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">{step > 0 ? <button type="button" onClick={() => { setError(""); setStep((value) => value - 1); }} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"><ArrowLeft size={14} /> Back</button> : <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><Sparkles size={12} className="text-sky-600" /> Takes about a minute</span>}{step < 2 && <Button size="sm" disabled={!canContinue} onClick={() => setStep((value) => value + 1)}>Continue <ArrowRight size={14} /></Button>}</div>
  </Card>;
}

const field = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-[11px] font-medium text-slate-600">{label}{children}</label>; }
function localDateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function to24Hour(time: string) { const [clock, period] = time.split(" "); const [hour, minute] = (clock ?? "9:00").split(":").map(Number); return `${String((hour % 12) + (period === "PM" ? 12 : 0)).padStart(2, "0")}:${String(minute).padStart(2, "0")}`; }
function formatPHP(value: number) { return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value); }
