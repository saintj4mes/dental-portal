import Link from "next/link";
import { ArrowRight, CreditCard, PhilippinePeso, ReceiptText } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { formatPHP } from "@/shared/lib/formatters";

export const dynamic = "force-dynamic";

const paymentMethods: Record<string, string> = {
  CASH: "Cash",
  GCASH: "GCash",
  MAYA: "Maya",
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
};

export default async function PaymentsPage() {
  const clinicId = await getClinicId();
  const [payments, totals] = await Promise.all([
    db.payment.findMany({
      where: { clinicId },
      include: { invoice: { include: { patient: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.payment.aggregate({ where: { clinicId }, _sum: { amount: true }, _count: true }),
  ]);

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-2 text-xs text-[#94908a]">Accounts & collections</p><h1 className="text-[24px] font-semibold tracking-tight text-slate-900">Payments</h1><p className="mt-1 text-[13px] text-[#615d59]">Recorded patient collections and official receipts.</p></div>
      <Link href="/billing" className="inline-flex items-center gap-2 rounded-lg bg-sky-800 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-900">Open billing <ArrowRight size={14} /></Link>
    </header>

    <div className="grid gap-3 sm:grid-cols-2">
      <Card className="p-4"><div className="flex items-center justify-between"><p className="text-[11px] text-slate-500">Total collected</p><PhilippinePeso size={16} className="text-sky-700" /></div><p className="mt-3 text-xl font-semibold">{formatPHP(Number(totals._sum.amount ?? 0))}</p><p className="mt-1 text-[10px] text-slate-400">Across recorded payments</p></Card>
      <Card className="p-4"><div className="flex items-center justify-between"><p className="text-[11px] text-slate-500">Payment records</p><ReceiptText size={16} className="text-sky-700" /></div><p className="mt-3 text-xl font-semibold">{totals._count.toLocaleString("en-PH")}</p><p className="mt-1 text-[10px] text-slate-400">Official receipts issued</p></Card>
    </div>

    <Card className="overflow-hidden">
      <div className="border-b border-[var(--color-border-subtle)] px-5 py-4"><h2 className="text-sm font-semibold text-slate-900">Recent payments</h2><p className="mt-1 text-[11px] text-slate-500">Showing the latest {payments.length} records</p></div>
      {payments.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Official receipt</th><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Method</th><th className="px-5 py-3 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{payments.map((payment) => <tr key={payment.id} className="hover:bg-slate-50/60"><td className="px-5 py-4 text-xs font-semibold text-sky-800">{payment.orNumber}</td><td className="px-4 py-4 text-xs font-medium">{payment.invoice.patient.firstName} {payment.invoice.patient.lastName}</td><td className="px-4 py-4 text-xs text-slate-600">{payment.invoice.invoiceNumber}</td><td className="px-4 py-4 text-xs text-slate-500">{payment.createdAt.toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric", timeZone: "Asia/Manila" })}</td><td className="px-4 py-4"><Badge tone="blue"><CreditCard size={12} />{paymentMethods[payment.paymentMethod] ?? payment.paymentMethod}</Badge>{payment.referenceNumber && <span className="ml-2 text-[10px] text-slate-400">{payment.referenceNumber}</span>}</td><td className="px-5 py-4 text-right text-xs font-semibold tabular-nums">{formatPHP(Number(payment.amount))}</td></tr>)}</tbody></table></div> : <div className="px-5 py-14 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-sky-50 text-sky-700"><ReceiptText size={18} /></div><p className="mt-3 text-sm font-semibold text-slate-800">No payments recorded yet</p><p className="mt-1 text-xs text-slate-500">Record a patient payment from an invoice in billing.</p><Link href="/billing" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky-800">Go to billing <ArrowRight size={13} /></Link></div>}
    </Card>
  </div>;
}
