import { Building2, CalendarPlus, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ChairSettings } from "@/modules/appointments/components/ChairSettings";
import { ClinicProfileForm } from "@/modules/auth/components/ClinicProfileForm";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";

export const dynamic = "force-dynamic";
export default async function SettingsPage() {
  let clinicId: string | null = null;
  let clinic = { name: "Smile Dental Studio", taxId: "009-451-238-000", address: "Unit 4B, Emerald Plaza, Ortigas Ave, Pasig City", contactNumber: "+63 2 8555 0123", officialReceiptPrefix: "OR", isVatRegistered: false };
  let chairs = [{ id: "chair-1", name: "Operatory 1", isActive: true }, { id: "chair-2", name: "Operatory 2", isActive: true }, { id: "chair-3", name: "Surgical suite", isActive: true }];
  try {
    clinicId = await getClinicId();
    const [clinicRecord, chairRows] = await Promise.all([db.clinic.findUnique({ where: { id: clinicId } }), db.dentalChair.findMany({ where: { clinicId }, orderBy: { name: "asc" } })]);
    if (clinicRecord) clinic = { name: clinicRecord.name, taxId: clinicRecord.taxId ?? "", address: clinicRecord.address ?? "", contactNumber: clinicRecord.contactNumber ?? "", officialReceiptPrefix: clinicRecord.officialReceiptPrefix, isVatRegistered: clinicRecord.isVatRegistered };
    chairs = chairRows;
  } catch { /* Show example configuration until a clinic database is connected. */ }

  return <div className="space-y-6">
    <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Workspace preferences</p><h1 className="text-[26px] font-semibold tracking-tight">Settings</h1><p className="mt-1 text-sm text-slate-500">Manage your clinic, billing preferences and integrations.</p></div>
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <Card className="p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-800"><Building2 size={17} /></span><div><h2 className="text-sm font-semibold">Clinic profile</h2><p className="mt-1 text-[11px] text-slate-400">Shown on invoices and patient reminders</p></div></div><ClinicProfileForm clinic={clinic} /></Card>
        <Card className="p-5 sm:p-6"><div className="mb-2 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-800"><CreditCard size={17} /></span><div><h2 className="text-sm font-semibold">Billing & tax</h2><p className="mt-1 text-[11px] text-slate-400">Philippine tax and receipt settings</p></div></div><div className="divide-y divide-slate-100"><Preference title="VAT registration" description={clinic.isVatRegistered ? "Clinic is VAT registered · 12% VAT applies" : "Clinic is non-VAT registered"} action={<Badge tone={clinic.isVatRegistered ? "blue" : "neutral"}>{clinic.isVatRegistered ? "VAT registered" : "Non-VAT"}</Badge>} /><Preference title="Official Receipt prefix" description={`New ORs use the ${clinic.officialReceiptPrefix}-00000001 sequence`} action={<Badge tone="neutral">Configured</Badge>} /><Preference title="Senior Citizen & PWD discounts" description="20% discount with VAT exemption and ID capture" action={<Badge tone="green">Enabled</Badge>} /></div></Card>
        <Card className="p-5 sm:p-6"><div className="mb-3 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-800"><CalendarPlus size={17} /></span><div><h2 className="text-sm font-semibold">Online appointment requests</h2><p className="mt-1 text-[11px] text-slate-400">Share a public booking request page</p></div></div>{clinicId ? <><a href={`/book/${clinicId}`} target="_blank" rel="noreferrer" className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-sky-800 hover:bg-slate-50">Open public booking page</a><p className="mt-2 break-all text-[10px] text-slate-400">Add /book/{clinicId} to your clinic website.</p></> : <p className="text-xs text-slate-400">Connect the clinic database to generate its booking page.</p>}</Card>
      </div>
      <div className="space-y-5">
        <Card className="p-5 sm:p-6"><div className="mb-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-800">▦</span><div><h2 className="text-sm font-semibold">Dental chairs</h2><p className="mt-1 text-[11px] text-slate-400">Manage operatories in the clinic calendar</p></div></div><ChairSettings chairs={chairs} /></Card>
        <Card className="p-5 sm:p-6"><div className="mb-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><ShieldCheck size={17} /></span><div><h2 className="text-sm font-semibold">Security & access</h2><p className="mt-1 text-[11px] text-slate-400">Clinic workspace access controls</p></div></div><Preference title="Secure sign-in" description="Session cookies are signed and HTTP-only" action={<CheckCircle2 size={16} className="text-emerald-600" />} /><Preference title="Patient record scope" description="Records are scoped to your clinic workspace" action={<CheckCircle2 size={16} className="text-emerald-600" />} /></Card>
      </div>
    </div>
  </div>;
}

function Preference({ title, description, action }: { title: string; description: string; action: React.ReactNode }) { return <div className="flex items-center justify-between gap-3 py-3"><div><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-[10px] text-slate-400">{description}</p></div>{action}</div>; }
