"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, CalendarDays, Check, ChevronRight, Clock3, FileText, MessageCircle, RotateCcw, Smartphone, WalletCards } from "lucide-react";

type MainTab = "appointments" | "chart" | "portal";
type PortalTab = "book" | "invoices" | "records" | "messages";
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const serviceChoices = ["Cleaning & polishing", "Tooth extraction", "Composite filling"];
const teeth = [...Array.from({ length: 8 }, (_, i) => 18 - i), ...Array.from({ length: 8 }, (_, i) => 21 + i), ...Array.from({ length: 8 }, (_, i) => 48 - i), ...Array.from({ length: 8 }, (_, i) => 31 + i)];
const statuses = ["Healthy", "Caries", "Composite", "Crown", "Root canal", "Missing"] as const;
type ToothStatus = typeof statuses[number];
const statusColors: Record<ToothStatus, string> = { Healthy: "bg-emerald-400", Caries: "bg-rose-400", Composite: "bg-blue-500", Crown: "bg-amber-400", "Root canal": "bg-pink-500", Missing: "bg-slate-400" };

export function InteractiveClinicDemo({ bookingHref }: { bookingHref: string | null }) {
  const [tab, setTab] = useState<MainTab>("appointments");
  const [day, setDay] = useState(1);
  const [portalTab, setPortalTab] = useState<PortalTab>("book");
  const [selectedService, setSelectedService] = useState(serviceChoices[0]);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [toothStates, setToothStates] = useState<Record<number, ToothStatus>>({ 18: "Missing", 16: "Composite", 14: "Caries", 6: "Crown", 4: "Composite", 31: "Missing", 32: "Root canal", 30: "Caries" });

  function cycleTooth(number: number) {
    setToothStates((current) => {
      const currentStatus = current[number] ?? "Healthy";
      const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length] ?? "Healthy";
      const next = { ...current };
      if (nextStatus === "Healthy") delete next[number]; else next[number] = nextStatus;
      return next;
    });
  }

  return <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6">
    <div className="mx-auto mb-6 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-2xl bg-slate-200/70 p-1.5">
      <MainTabButton active={tab === "appointments"} onClick={() => setTab("appointments")} icon={<CalendarDays size={15} />}>Appointments</MainTabButton>
      <MainTabButton active={tab === "chart"} onClick={() => setTab("chart")} icon={<FileText size={15} />}>Dental chart</MainTabButton>
      <MainTabButton active={tab === "portal"} onClick={() => setTab("portal")} icon={<Smartphone size={15} />}>Patient portal</MainTabButton>
    </div>

    <div key={tab} className="min-h-[335px] animate-[demo-in_280ms_ease-out] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,.05)] sm:p-6">
      {tab === "appointments" && <AppointmentsDemo day={day} setDay={setDay} />}
      {tab === "chart" && <DentalChartDemo toothStates={toothStates} cycleTooth={cycleTooth} reset={() => setToothStates({})} />}
      {tab === "portal" && <PatientPortalDemo tab={portalTab} setTab={setPortalTab} service={selectedService} setService={setSelectedService} time={selectedTime} setTime={setSelectedTime} bookingHref={bookingHref} />}
    </div>
    <p className="mt-3 text-center text-[10px] text-slate-400">Interactive sample · changes here are a preview and won’t update clinic records.</p>
  </section>;
}

function MainTabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition duration-200 sm:px-4 ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:bg-white/60 hover:text-slate-900"}`}>{icon}{children}</button>;
}

function AppointmentsDemo({ day, setDay }: { day: number; setDay: (value: number) => void }) {
  const schedule = [
    [{ time: "9:00 AM", name: "Sofia Reyes", reason: "Cleaning & polishing", color: "border-sky-300 bg-sky-50" }, { time: "1:00 PM", name: "Gabriel Tan", reason: "Root canal review", color: "border-violet-300 bg-violet-50" }],
    [{ time: "10:00 AM", name: "Juancho Dela Cruz", reason: "Cleaning & polishing", color: "border-sky-300 bg-sky-50" }, { time: "11:30 AM", name: "Amelia Dizon", reason: "Follow-up", color: "border-emerald-300 bg-emerald-50" }, { time: "2:00 PM", name: "Miguel Santos", reason: "Tooth restoration", color: "border-amber-300 bg-amber-50" }],
    [{ time: "9:30 AM", name: "Isabella Lim", reason: "Consultation", color: "border-blue-300 bg-blue-50" }, { time: "3:00 PM", name: "Noah Garcia", reason: "Routine cleaning", color: "border-sky-300 bg-sky-50" }],
    [{ time: "8:30 AM", name: "Paolo Mendoza", reason: "New patient visit", color: "border-blue-300 bg-blue-50" }, { time: "1:30 PM", name: "Lara Villanueva", reason: "Dental check-up", color: "border-amber-300 bg-amber-50" }],
    [{ time: "10:30 AM", name: "Elena Reyes", reason: "Denture adjustment", color: "border-violet-300 bg-violet-50" }],
  ][day] ?? [];
  return <div><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-700">Your clinic at a glance</p><h2 className="mt-1 text-lg font-semibold">Appointments</h2><p className="mt-1 text-xs text-slate-500">Tap a day to explore a sample schedule.</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{schedule.length} visits</span></div>
    <div className="mt-5 flex gap-2 overflow-x-auto pb-1">{days.map((name, index) => <button key={name} type="button" onClick={() => setDay(index)} className={`min-w-[64px] rounded-xl border px-3 py-2 text-center transition duration-200 hover:-translate-y-0.5 ${day === index ? "border-sky-600 bg-sky-700 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"}`}><span className="block text-[10px] opacity-75">{name}</span><span className="mt-0.5 block text-sm font-semibold">{16 + index}</span></button>)}</div>
    <div key={day} className="mt-4 grid gap-2 animate-[demo-in_220ms_ease-out] sm:grid-cols-2">{schedule.map((item) => <div key={`${item.time}-${item.name}`} className={`flex items-center gap-3 rounded-xl border-l-[3px] p-3 ${item.color}`}><span className="min-w-[58px] text-[10px] font-semibold text-slate-700">{item.time}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-900">{item.name}</span><span className="mt-0.5 block truncate text-[10px] text-slate-500">{item.reason}</span></span><ChevronRight size={14} className="text-slate-400" /></div>)}</div></div>;
}

function DentalChartDemo({ toothStates, cycleTooth, reset }: { toothStates: Record<number, ToothStatus>; cycleTooth: (number: number) => void; reset: () => void }) {
  const [selected, setSelected] = useState(18);
  const selectedStatus = toothStates[selected] ?? "Healthy";
  return <div><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-700">Interactive sample</p><h2 className="mt-1 text-lg font-semibold">Dental chart</h2><p className="mt-1 text-xs text-slate-500">Tap a tooth to select it, then tap again to cycle its condition.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-medium text-slate-500 transition hover:bg-slate-50"><RotateCcw size={12} /> Reset</button></div>
    <div className="mt-5 rounded-xl border border-slate-200 bg-[#fcfcfb] p-3 sm:p-4"><p className="mb-3 text-[11px] font-medium text-slate-700">Tooth <span className="font-bold">{selected}</span><span className="text-slate-400"> — {selectedStatus}</span></p><div className="overflow-x-auto pb-2"><div className="min-w-[590px]"><div className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1 border-b border-dashed border-slate-200 pb-3">{teeth.slice(0, 16).map((number) => <ToothButton key={number} number={number} status={toothStates[number] ?? "Healthy"} selected={selected === number} onClick={() => { setSelected(number); cycleTooth(number); }} />)}</div><div className="mt-3 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1">{teeth.slice(16).map((number) => <ToothButton key={number} number={number} status={toothStates[number] ?? "Healthy"} selected={selected === number} onClick={() => { setSelected(number); cycleTooth(number); }} />)}</div></div></div><div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 border-t border-slate-100 pt-3">{statuses.map((status) => <span key={status} className="flex items-center gap-1.5 text-[9px] text-slate-500"><span className={`h-2 w-2 rounded-full ${statusColors[status]}`} />{status}</span>)}</div></div></div>;
}

function ToothButton({ number, status, selected, onClick }: { number: number; status: ToothStatus; selected: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label={`Tooth ${number}, ${status}`} className={`group flex min-w-0 flex-col items-center gap-1 rounded-lg border px-0.5 py-1 transition duration-150 hover:-translate-y-0.5 hover:shadow-sm ${selected ? "border-sky-500 bg-white ring-2 ring-sky-100" : "border-transparent hover:border-slate-200"}`}><span className={`relative grid h-7 w-full max-w-7 place-items-center rounded-[45%_45%_40%_40%] border border-slate-300 bg-gradient-to-b from-white to-[#eee9dd] text-[9px] text-slate-600 ${status === "Missing" ? "opacity-40" : ""}`}><span className={`absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full ring-1 ring-white ${statusColors[status]} ${status === "Healthy" ? "opacity-0 group-hover:opacity-40" : ""}`} /></span><span className="text-[8px] text-slate-400">{number}</span></button>;
}

function PatientPortalDemo({ tab, setTab, service, setService, time, setTime, bookingHref }: { tab: PortalTab; setTab: (value: PortalTab) => void; service: string; setService: (value: string) => void; time: string; setTime: (value: string) => void; bookingHref: string | null }) {
  const tabs: { id: PortalTab; label: string; icon: React.ReactNode }[] = [{ id: "book", label: "Book", icon: <CalendarDays size={14} /> }, { id: "invoices", label: "Invoices", icon: <WalletCards size={14} /> }, { id: "records", label: "Records", icon: <FileText size={14} /> }, { id: "messages", label: "Messages", icon: <MessageCircle size={14} /> }];
  return <div className="mx-auto max-w-xl"><div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-700">A simple view for patients</p><h2 className="mt-1 text-lg font-semibold">Patient portal</h2></div><div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><p className="text-xs text-slate-600">Hi, <span className="font-semibold text-slate-900">Juancho</span> — this is your patient portal.</p><div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5"><p className="text-[9px] font-semibold uppercase tracking-wide text-sky-700">Your next appointment</p><p className="mt-1 text-sm font-semibold text-slate-900">Tuesday, 16 September</p><p className="mt-0.5 text-[11px] text-slate-600">10:00 AM · Cleaning & polishing</p><p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500"><Activity size={11} /> Dr. Reyes · Lipa City branch</p><span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-semibold text-emerald-800"><Check size={10} /> Confirmed</span></div><div className="mt-3 grid grid-cols-4 gap-1.5">{tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} aria-pressed={tab === item.id} className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl border p-2.5 transition duration-200 hover:-translate-y-0.5 ${tab === item.id ? "border-slate-900 bg-white shadow-sm" : "border-slate-200 hover:border-sky-300"}`}><span className={`grid h-7 w-7 place-items-center rounded-lg ${tab === item.id ? "bg-sky-50 text-sky-700" : "bg-slate-50 text-slate-600"}`}>{item.icon}</span><span className="text-[9px] font-medium text-slate-700">{item.label}</span></button>)}</div>
    <div key={tab} className="mt-3 min-h-[130px] animate-[demo-in_240ms_ease-out] rounded-xl border border-slate-200 p-3">
      {tab === "book" && <><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Book another visit</p><div className="mt-2 grid gap-1.5">{serviceChoices.map((choice) => <button key={choice} type="button" onClick={() => setService(choice)} className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-[10px] transition ${service === choice ? "bg-sky-50 font-semibold text-sky-900 ring-1 ring-sky-200" : "text-slate-700 hover:bg-slate-50"}`}>{choice}<span className="text-slate-500">{choice === "Cleaning & polishing" ? "₱1,200" : "₱2,500"}</span></button>)}</div><div className="mt-2 flex items-center justify-between gap-2"><div className="flex items-center gap-1.5"><Clock3 size={12} className="text-slate-400" /><select aria-label="Preferred appointment time" value={time} onChange={(event) => setTime(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] text-slate-700"><option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>1:00 PM</option><option>2:00 PM</option></select></div>{bookingHref ? <Link href={bookingHref} className="inline-flex items-center gap-1 rounded-lg bg-sky-700 px-2.5 py-2 text-[10px] font-semibold text-white transition hover:bg-sky-800">Continue booking <ArrowRight size={12} /></Link> : <span className="text-[9px] text-slate-400">Ask your clinic for its booking link</span>}</div></>}
      {tab === "invoices" && <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><span><span className="block text-[10px] font-semibold text-slate-800">INV-2026-001 · Cleaning</span><span className="mt-1 block text-[9px] text-slate-500">Due 20 September</span></span><span className="text-xs font-semibold text-slate-900">₱1,200</span></div>}
      {tab === "records" && <div className="space-y-2"><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Recent visit records</p><div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3"><FileText size={14} className="text-violet-600" /><span><span className="block text-[10px] font-semibold text-slate-800">Dental examination</span><span className="mt-0.5 block text-[9px] text-slate-500">12 August · Dr. Reyes</span></span></div></div>}
      {tab === "messages" && <div className="rounded-lg bg-amber-50 p-3"><p className="text-[10px] font-semibold text-slate-800">Clinic reminder</p><p className="mt-1 text-[10px] leading-4 text-slate-600">Please arrive 10 minutes early for your appointment. Bring your HMO card if applicable.</p><span className="mt-2 block text-[9px] text-slate-400">Today · 9:15 AM</span></div>}
    </div><p className="mt-3 text-center text-[9px] text-slate-500">Booking links open the live request form. The other portal panels are sample screens.</p></div></div>;
}
