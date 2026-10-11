import { notFound } from "next/navigation";
import { Activity, MapPin, Phone } from "lucide-react";
import { db } from "@/shared/db";
import { Card } from "@/shared/components/ui/card";
import { PublicBookingForm } from "@/modules/booking/components/PublicBookingForm";

export const dynamic = "force-dynamic";

export default async function PublicBookingPage({ params }: { params: Promise<{ clinicId: string }> }) {
  const { clinicId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(clinicId)) notFound();
  const [clinic, treatments] = await Promise.all([
    db.clinic.findUnique({ where: { id: clinicId }, select: { id: true, name: true, address: true, contactNumber: true } }),
    db.treatment.findMany({ where: { clinicId }, select: { name: true, defaultPrice: true }, orderBy: { name: "asc" }, take: 12 }),
  ]);
  if (!clinic) notFound();
  const services = treatments.map((treatment) => ({ name: treatment.name, price: Number(treatment.defaultPrice) }));
  const choices = services.length ? services : [{ name: "Consultation", price: 800 }, { name: "Cleaning & polishing", price: 1500 }, { name: "Tooth restoration", price: 2500 }];
  return <main className="min-h-screen bg-[#f7f8f8] px-4 py-8 sm:py-12"><div className="mx-auto max-w-5xl"><header className="mb-8 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-sky-600 text-white"><Activity size={21} /></span><p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">Patient portal · appointment booking</p><h1 className="mt-1 text-2xl font-semibold">{clinic.name}</h1><div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-500">{clinic.address && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {clinic.address}</span>}{clinic.contactNumber && <span className="inline-flex items-center gap-1"><Phone size={13} /> {clinic.contactNumber}</span>}</div></header><div className="mx-auto grid max-w-4xl items-start gap-5 md:grid-cols-[0.8fr_1.2fr]"><Card className="overflow-hidden bg-sky-950 p-6 text-white md:sticky md:top-8"><div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-sky-200"><Activity size={18} /></div><p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">Welcome</p><h2 className="mt-2 text-xl font-semibold">Your next visit starts here.</h2><p className="mt-3 text-xs leading-5 text-sky-100">Choose a service and preferred time. The clinic team will confirm availability with you.</p><div className="mt-6 space-y-3 border-t border-white/15 pt-4 text-[11px] leading-5 text-sky-100"><p>Requests are reviewed by the clinic during business hours.</p><p>Please call the clinic directly if you need urgent dental care.</p></div></Card><PublicBookingForm clinicId={clinic.id} clinicName={clinic.name} services={choices} /></div><p className="mt-8 text-center text-[10px] leading-4 text-slate-400">Your details are shared with {clinic.name} only to process this appointment request.</p></div></main>;
}
