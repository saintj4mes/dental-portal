import { ArrowDownToLine, FileText, Receipt, TrendingUp } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { InvoiceBuilder, type InvoicePatientChoice } from "@/modules/billing/components/InvoiceBuilder";
import { RecordPaymentDialog } from "@/modules/billing/components/RecordPaymentDialog";
import { HmoClaimDialog } from "@/modules/billing/components/HmoClaimDialog";
import { demoPatients } from "@/modules/patients/data/demo-patients";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { formatPHP } from "@/shared/lib/formatters";

export const dynamic = "force-dynamic";
interface BillingInvoice { id: string; no: string; patient: string; date: string; due: number; status: string; hmo: string; hmoStatus: string | null; approvalCode: string | null; coveredAmount: number }
const fallbackInvoices: BillingInvoice[] = [
  { id: "00000000-0000-4000-8000-000000000401", no: "INV-2026-0048", patient: "Sofia Reyes", date: "Oct 10, 2026", due: 2500, status: "UNPAID", hmo: "—", hmoStatus: null, approvalCode: null, coveredAmount: 0 },
  { id: "00000000-0000-4000-8000-000000000402", no: "INV-2026-0047", patient: "Miguel Santos", date: "Oct 10, 2026", due: 1450, status: "PARTIAL", hmo: "Maxicare", hmoStatus: "PENDING", approvalCode: null, coveredAmount: 0 },
  { id: "00000000-0000-4000-8000-000000000403", no: "INV-2026-0046", patient: "Isabella Lim", date: "Oct 09, 2026", due: 0, status: "PAID", hmo: "—", hmoStatus: null, approvalCode: null, coveredAmount: 0 },
  { id: "00000000-0000-4000-8000-000000000404", no: "INV-2026-0045", patient: "Gabriel Tan", date: "Oct 09, 2026", due: 6800, status: "UNPAID", hmo: "Intellicare", hmoStatus: "APPROVED", approvalCode: "IC-49382", coveredAmount: 4200 },
];

export default async function BillingPage() {
  let patients: InvoicePatientChoice[] = demoPatients.map((patient) => ({ id: patient.id, name: patient.name, seniorPwdId: patient.seniorPwd ? "SC-2026-0041" : null }));
  let invoices: BillingInvoice[] = fallbackInvoices;
  let isVatRegistered = false;
  try {
    const clinicId = await getClinicId();
    const [patientRows, invoiceRows, clinic] = await Promise.all([
      db.patient.findMany({ where: { clinicId }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }], take: 250 }),
      db.invoice.findMany({ where: { clinicId }, include: { patient: true }, orderBy: { createdAt: "desc" }, take: 50 }),
      db.clinic.findUnique({ where: { id: clinicId }, select: { isVatRegistered: true } }),
    ]);
    patients = patientRows.map((patient) => ({ id: patient.id, name: `${patient.firstName} ${patient.lastName}`, seniorPwdId: patient.seniorPwdId }));
    invoices = invoiceRows.map((invoice) => ({ id: invoice.id, no: invoice.invoiceNumber, patient: `${invoice.patient.firstName} ${invoice.patient.lastName}`, date: invoice.createdAt.toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" }), due: Number(invoice.patientDueAmount), status: invoice.paymentStatus, hmo: invoice.hmoProvider ?? "—", hmoStatus: invoice.hmoClaimStatus, approvalCode: invoice.hmoApprovalCode, coveredAmount: Number(invoice.hmoCoveredAmount) }));
    isVatRegistered = clinic?.isVatRegistered ?? false;
  } catch { /* Show the billing workspace preview until the clinic database is connected. */ }
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Accounts & collections</p><h1 className="text-[26px] font-semibold tracking-tight">Billing</h1><p className="mt-1 text-sm text-slate-500">Invoices, statutory discounts, HMO cover and official receipts.</p></div><div className="flex gap-2"><Button variant="secondary"><ArrowDownToLine size={15} /> Export</Button><InvoiceBuilder patients={patients} isVatRegistered={isVatRegistered} /></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Collected this month" value={formatPHP(186450)} sub="+13.5% from last month" icon={<TrendingUp size={16} />} /><Stat label="Outstanding balance" value={formatPHP(42300)} sub="Across 18 invoices" icon={<Receipt size={16} />} /><Stat label="HMO claims pending" value={formatPHP(18750)} sub="7 claims · 3 providers" icon={<FileText size={16} />} /><Stat label="VAT collected" value={formatPHP(12720)} sub="VAT-inclusive services" icon={<span className="text-xs font-bold">VAT</span>} /></div>
    <Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><h2 className="text-sm font-semibold">Recent invoices</h2><p className="mt-1 text-[11px] text-slate-400">BIR-compliant invoice and OR records</p></div><div className="flex gap-2"><button className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-600">All invoices⌄</button><button className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-600">This month⌄</button></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[870px] text-left"><thead><tr className="border-y border-slate-100 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Invoice</th><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">HMO claim</th><th className="px-4 py-3">Patient due</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{invoices.map((invoice) => <tr key={invoice.no} className="hover:bg-slate-50/60"><td className="px-5 py-4 text-xs font-semibold text-sky-800">{invoice.no}</td><td className="px-4 py-4 text-xs font-medium">{invoice.patient}</td><td className="px-4 py-4 text-xs text-slate-500">{invoice.date}</td><td className="px-4 py-4"><span className="block text-xs text-slate-600">{invoice.hmo}</span>{invoice.hmoStatus && <div className="mt-1 flex items-center gap-2"><Badge tone={invoice.hmoStatus === "APPROVED" ? "green" : invoice.hmoStatus === "DENIED" ? "red" : "amber"}>{invoice.hmoStatus.toLowerCase()}</Badge><HmoClaimDialog invoiceId={invoice.id} provider={invoice.hmo} approvalCode={invoice.approvalCode} coveredAmount={invoice.coveredAmount} status={invoice.hmoStatus} /></div>}{!invoice.hmoStatus && <HmoClaimDialog invoiceId={invoice.id} provider={invoice.hmo} approvalCode={invoice.approvalCode} coveredAmount={invoice.coveredAmount} status={invoice.hmoStatus} />}</td><td className="px-4 py-4 text-xs font-semibold">{formatPHP(invoice.due)}</td><td className="px-4 py-4"><Badge tone={invoice.status === "PAID" ? "green" : invoice.status === "PARTIAL" ? "amber" : "red"}>{invoice.status.toLowerCase()}</Badge></td><td className="px-4 py-4">{invoice.due > 0 && <RecordPaymentDialog invoiceId={invoice.id} amountDue={invoice.due} />}</td></tr>)}</tbody></table></div>
    </Card>
  </div>;
}
function Stat({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) { return <Card className="p-4"><div className="flex items-center justify-between"><p className="text-[11px] text-slate-500">{label}</p><span className="text-sky-700">{icon}</span></div><p className="mt-3 text-xl font-semibold">{value}</p><p className="mt-1 text-[10px] text-slate-400">{sub}</p></Card>; }
