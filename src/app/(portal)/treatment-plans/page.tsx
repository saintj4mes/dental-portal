import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { formatPHP } from "@/shared/lib/formatters";

export const dynamic = "force-dynamic";

const statusTone = (status: string): "blue" | "green" | "amber" | "red" => {
  if (status === "ACCEPTED" || status === "COMPLETED") return "green";
  if (status === "PRESENTED" || status === "IN_PROGRESS") return "blue";
  if (status === "DECLINED") return "red";
  return "amber";
};

export default async function TreatmentPlansPage() {
  const clinicId = await getClinicId();
  const plans = await db.treatmentPlan.findMany({
    where: { clinicId },
    include: { patient: { select: { id: true, firstName: true, lastName: true } }, items: true },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return <div className="space-y-6">
    <header><p className="mb-2 text-xs text-[#94908a]">Clinical care</p><h1 className="text-[24px] font-semibold tracking-tight text-slate-900">Treatment plans</h1><p className="mt-1 text-[13px] text-[#615d59]">Review recommended care, treatment items, and patient decisions.</p></header>
    <Card className="overflow-hidden">
      <div className="border-b border-[var(--color-border-subtle)] px-5 py-4"><h2 className="text-sm font-semibold text-slate-900">Clinic treatment plans</h2><p className="mt-1 text-[11px] text-slate-500">Showing the latest {plans.length} plans</p></div>
      {plans.length ? <div className="divide-y divide-slate-100">{plans.map((plan) => {
        const total = plan.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
        return <article key={plan.id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-slate-900">{plan.title}</h3><Badge tone={statusTone(plan.status)}>{plan.status.toLowerCase().replaceAll("_", " ")}</Badge></div><Link href={`/patients/${plan.patient.id}`} className="mt-1 inline-flex items-center gap-1 text-xs text-sky-800 hover:text-sky-950">{plan.patient.firstName} {plan.patient.lastName}<ArrowRight size={12} /></Link><ul className="mt-3 space-y-1">{plan.items.map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-x-4 text-[11px] text-slate-500"><span>{item.quantity} × {item.name}{item.toothNumbers.length ? ` · FDI ${item.toothNumbers.join(", ")}` : ""}</span><span>{formatPHP(Number(item.unitPrice) * item.quantity)}</span></li>)}</ul></div>
          <div className="text-right"><p className="text-[10px] text-slate-400">Updated {plan.updatedAt.toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric", timeZone: "Asia/Manila" })}</p><p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{formatPHP(total)}</p></div>
        </article>;
      })}</div> : <div className="px-5 py-14 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-sky-50 text-sky-700"><ClipboardList size={18} /></div><p className="mt-3 text-sm font-semibold text-slate-800">No treatment plans yet</p><p className="mt-1 text-xs text-slate-500">Create a plan from a patient profile to see it here.</p><Link href="/patients" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky-800">View patients <ArrowRight size={13} /></Link></div>}
    </Card>
  </div>;
}
