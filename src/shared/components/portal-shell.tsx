"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, BellRing, BriefcaseBusiness, CalendarDays, ChevronRight, CircleHelp, ClipboardCheck, ClipboardList, ContactRound, CreditCard, FileText, FlaskConical, LayoutDashboard, Package, Pill, ReceiptText, Search, Settings2, Sparkles, Stethoscope, UsersRound, WalletCards, Clock4 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { LogoutButton } from "@/modules/auth/components/LogoutButton";
import { DemoBranchSelector } from "@/modules/auth/components/DemoBranchSelector";
import { demoBranches } from "@/shared/lib/demo-branches";

const groups = [
    { label: "Clinic", links: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/calendar", label: "Agenda", icon: CalendarDays },
    { href: "/patients", label: "Patients", icon: UsersRound },
    { href: "/contacts", label: "Contacts", icon: ContactRound },
    { href: "/leads", label: "Patient leads", icon: Sparkles },
    { href: "/booking-requests", label: "Online booking requests", icon: CalendarDays },
  ] },
  { label: "Clinical", links: [
    { href: "/treatment-plans", label: "Treatment plans", icon: ClipboardList },
    { href: "/budgets", label: "Treatment budgets", icon: WalletCards },
    { href: "/prescriptions", label: "Prescriptions", icon: Pill },
    { href: "/lab-orders", label: "Lab orders", icon: FlaskConical },
    { href: "/orthodontics", label: "Orthodontics", icon: Stethoscope },
    { href: "/imaging", label: "Imaging studies", icon: FileText },
    { href: "/documents", label: "Documents", icon: FileText },
  ] },
  { label: "Operations", links: [
    { href: "/billing", label: "Invoices", icon: ReceiptText },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/procurement", label: "Procurement", icon: BriefcaseBusiness },
    { href: "/expenses", label: "Expenses", icon: WalletCards },
    { href: "/recalls", label: "Recalls", icon: BellRing },
    { href: "/attendance", label: "Staff attendance", icon: Clock4 },
    { href: "/tasks", label: "Team tasks", icon: ClipboardCheck },
    { href: "/treasury", label: "Treasury", icon: WalletCards },
    { href: "/payroll", label: "Payroll", icon: WalletCards },
    { href: "/accounting-export", label: "Accounting exports", icon: FileText },
  ] },
  { label: "Insights", links: [
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/journal", label: "Activity journal", icon: FileText },
  ] },
];
const mobileLinks = groups.flatMap((group) => group.links).filter((link) => ["/dashboard", "/calendar", "/patients", "/billing"].includes(link.href));

export function PortalShell({ children, demoBranchId }: { children: React.ReactNode; demoBranchId?: string }) {
  const pathname = usePathname();
  const activeDemoBranch = demoBranches.find((branch) => branch.id === demoBranchId);
  return <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] flex-col border-r border-[var(--color-border-subtle)] bg-white print:hidden lg:flex">
      <Link href="/dashboard" className="flex h-[60px] items-center gap-3 border-b border-[var(--color-border-subtle)] px-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-500 text-white"><Activity size={18} strokeWidth={2.5} /></span>
        <span className="text-[17px] font-semibold tracking-tight text-slate-900">dental<span className="text-sky-600">pin</span></span>
      </Link>
      <div className="px-3 pt-3"><div className="flex w-full items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-2 text-left">{demoBranchId ? <DemoBranchSelector activeBranchId={demoBranchId} /> : <><div className="grid h-8 w-8 place-items-center rounded-md bg-sky-50 text-xs font-semibold text-sky-700">{activeDemoBranch?.name.slice(0, 2).toUpperCase() ?? "CL"}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{activeDemoBranch?.name ?? "Clinic workspace"}</p><p className="mt-0.5 text-[10px] text-slate-400">{activeDemoBranch?.location ?? "Clinic workspace"}</p></div></>}</div></div>
      <nav className="mt-3 flex-1 overflow-y-auto px-2.5 pb-3">
        {groups.map((group) => <section key={group.label} className="mb-4">
          <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#94908a]">{group.label}</p>
          <div className="space-y-0.5">{group.links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return <Link key={href} href={href} className={cn("flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] transition-colors", active ? "bg-sky-50 font-medium text-sky-800" : "text-[#615d59] hover:bg-[#f4f2ef] hover:text-slate-900")}>
              <Icon size={16} strokeWidth={active ? 2 : 1.8} />{label}{active && <ChevronRight size={13} className="ml-auto opacity-60" />}
            </Link>;
          })}</div>
        </section>)}
        <Link href="/settings" className={cn("flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px]", pathname.startsWith("/settings") ? "bg-sky-50 font-medium text-sky-800" : "text-[#615d59] hover:bg-[#f4f2ef]")}><Settings2 size={16} /> Settings</Link>
        <div className="mt-1"><LogoutButton /></div>
      </nav>
      <div className="m-3 rounded-lg bg-[#f4f2ef] p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700"><Sparkles size={14} className="text-sky-600" /> Clinic tip</div>
        <p className="text-[11px] leading-relaxed text-[#615d59]">A quick chart update keeps every visit consistent. Your team’s records are looking good.</p>
        <Link href="/patients" className="mt-3 inline-block text-[11px] font-semibold text-sky-700">View patient records →</Link>
      </div>
      <div className="flex items-center gap-3 border-t border-[var(--color-border-subtle)] px-4 py-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#efede9] text-xs font-semibold text-[#615d59]">MC</div>
        <div className="flex-1"><p className="text-xs font-semibold">Dr. Maria Cruz</p><p className="mt-0.5 text-[10px] text-[#94908a]">Clinic owner</p></div>
        <CircleHelp size={16} className="text-[#94908a]" />
      </div>
    </aside>
    <div className="lg:pl-[244px]">
      <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-[var(--color-border-subtle)] bg-white/95 px-5 backdrop-blur print:hidden md:px-7">
        <div className="hidden items-center gap-2 text-xs text-[#94908a] md:flex"><span>Clinic</span><span>/</span><span className="font-medium capitalize text-[#615d59]">{pathname.split("/")[1]?.replaceAll("-", " ") || "overview"}</span></div>
        <div className="ml-auto flex items-center gap-3">
          <label className="hidden h-8 w-56 items-center gap-2 rounded-md bg-[#f4f2ef] px-2.5 text-[#94908a] sm:flex"><Search size={14} /><input className="w-full bg-transparent text-xs outline-none placeholder:text-[#94908a]" placeholder="Search patients, records..." /><kbd className="rounded border border-black/10 bg-white px-1 text-[9px]">⌘ K</kbd></label>
          <button className="grid h-8 w-8 place-items-center rounded-md text-[#615d59] hover:bg-[#f4f2ef]"><CircleHelp size={16} /></button>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#efede9] text-xs font-semibold text-[#615d59]">MC</div>
        </div>
      </header>
      <main className="mx-auto max-w-[1520px] px-5 py-6 pb-24 md:px-7 md:py-8 lg:pb-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[var(--color-border)] bg-white/95 px-2 py-2 backdrop-blur print:hidden lg:hidden">{[...mobileLinks, { href: "/settings", label: "Settings", icon: Settings2 }].map(({ href, label, icon: Icon }) => { const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href)); return <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 rounded-md py-1 text-[10px]", active ? "text-sky-700" : "text-[#94908a]")}><Icon size={17} />{label}</Link>; })}</nav>
    </div>
  </div>;
}
