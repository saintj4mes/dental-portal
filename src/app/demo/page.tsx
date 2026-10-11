import Link from "next/link";
import { Activity, ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { InteractiveClinicDemo } from "@/modules/public-demo/components/InteractiveClinicDemo";
import { demoClinicId } from "@/shared/lib/demo-branches";

export const metadata = { title: "Interactive clinic demo | dentalpin" };

export default function DemoPage() {
  const publicClinicId = process.env.PUBLIC_BOOKING_CLINIC_ID ?? (process.env.NODE_ENV === "production" ? null : process.env.AUTH_CLINIC_ID ?? demoClinicId);
  const bookingHref = publicClinicId ? `/book/${publicClinicId}` : null;
  return <main className="min-h-screen bg-[#f7f9fb] text-slate-900">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8"><Link href="/login" className="flex items-center gap-2 text-base font-bold tracking-tight"> <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-700 text-white"><Activity size={17} /></span> dental<span className="-ml-2 text-sky-700">pin</span></Link><Link href="/login" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-800">Clinic sign in <ArrowRight size={13} /></Link></header>
    <section className="mx-auto max-w-4xl px-5 pb-7 pt-7 text-center sm:px-8 sm:pt-12"><span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[10px] font-semibold text-sky-800 shadow-sm"><Sparkles size={12} /> Your clinic, connected</span><h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-[42px]">A smoother day for your dental clinic.</h1><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">Explore appointments, interactive dental charting, and the patient portal. Tap around to see how the workspace feels.</p><div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-slate-500"><span className="flex items-center gap-1"><Check size={12} className="text-emerald-600" /> Designed for Philippine clinics</span><span className="flex items-center gap-1"><Check size={12} className="text-emerald-600" /> Works on desktop and mobile</span><span className="flex items-center gap-1"><ShieldCheck size={12} className="text-sky-700" /> Sample records only</span></div></section>
    <InteractiveClinicDemo bookingHref={bookingHref} />
    <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6"><div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-sky-950 px-5 py-6 text-center text-white sm:flex-row sm:px-7 sm:text-left"><div><p className="text-sm font-semibold">Ready to try the patient booking flow?</p><p className="mt-1 text-xs text-sky-100">Patients choose a treatment and preferred time, then your team confirms the request.</p></div>{bookingHref ? <Link href={bookingHref} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-sky-950 transition hover:bg-sky-50">Open patient portal <ArrowRight size={14} /></Link> : <span className="text-[10px] text-sky-200">Configure PUBLIC_BOOKING_CLINIC_ID to preview a clinic link.</span>}</div></section>
  </main>;
}
