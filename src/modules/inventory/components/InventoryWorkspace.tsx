"use client";

import { useState, useTransition } from "react";
import { PackagePlus, Plus, ArrowDownToLine } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { createInventoryItem, recordStockMovement } from "../actions/inventory";

type ItemView = { id: string; sku: string | null; name: string; category: string; unit: string; quantity: number; reorderLevel: number; unitCost: number | null; expiresAt: string | null; latestKind: string | null; latestAt: string | null };
const inputClass = "h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-sky-500";

export function InventoryWorkspace({ items }: { items: ItemView[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  function create(formData: FormData) {
    setError("");
    const payload = Object.fromEntries(formData.entries());
    startTransition(async () => { const result = await createInventoryItem(payload); if (result.success) { setOpen(false); location.reload(); } else setError(result.error); });
  }
  function movement(formData: FormData) {
    setError("");
    const payload = Object.fromEntries(formData.entries());
    startTransition(async () => { const result = await recordStockMovement(payload); if (result.success) location.reload(); else setError(result.error); });
  }
  const lowCount = items.filter((item) => item.quantity <= item.reorderLevel).length;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">Clinic operations</p><h1 className="mt-1 text-xl font-semibold">Inventory</h1><p className="mt-1 text-xs text-slate-500">Stock levels, expiry dates, and auditable quantity movements</p></div><Button size="sm" onClick={() => setOpen(!open)}><Plus size={14} /> Add stock item</Button></div>
    <div className="grid gap-3 sm:grid-cols-3"><Metric label="Active items" value={String(items.length)} /><Metric label="Below reorder level" value={String(lowCount)} tone={lowCount ? "text-amber-700" : ""} /><Metric label="Stock value" value={money(items.reduce((total, item) => total + item.quantity * (item.unitCost ?? 0), 0))} /></div>
    {open && <Card className="p-4"><form action={create} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field label="Item name"><input name="name" required minLength={2} className={inputClass} /></Field><Field label="Category"><input name="category" required placeholder="Clinical supplies" className={inputClass} /></Field><Field label="SKU"><input name="sku" className={inputClass} /></Field><Field label="Unit"><input name="unit" defaultValue="unit" required className={inputClass} /></Field><Field label="Opening quantity"><input name="quantity" type="number" min="0" step="0.01" defaultValue="0" className={inputClass} /></Field><Field label="Reorder level"><input name="reorderLevel" type="number" min="0" step="0.01" defaultValue="0" className={inputClass} /></Field><Field label="Unit cost (₱)"><input name="unitCost" type="number" min="0" step="0.01" className={inputClass} /></Field><Field label="Expiry date"><input name="expiresAt" type="date" className={inputClass} /></Field><div className="sm:col-span-2 lg:col-span-4">{error && <p className="mb-2 text-xs text-red-600">{error}</p>}<Button size="sm" disabled={pending}><PackagePlus size={14} /> {pending ? "Saving…" : "Save item"}</Button></div></form></Card>}
    <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr>{["Item", "Category", "On hand", "Reorder at", "Unit cost", "Expiry", "Movement"].map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.id}><td className="px-4 py-3"><p className="text-xs font-semibold text-slate-800">{item.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.sku || item.unit}</p></td><td className="px-4 py-3 text-xs text-slate-500">{item.category}</td><td className={`px-4 py-3 text-xs font-semibold ${item.quantity <= item.reorderLevel ? "text-amber-700" : "text-slate-700"}`}>{item.quantity} {item.unit}</td><td className="px-4 py-3 text-xs text-slate-500">{item.reorderLevel}</td><td className="px-4 py-3 text-xs text-slate-500">{item.unitCost === null ? "—" : money(item.unitCost)}</td><td className="px-4 py-3 text-xs text-slate-500">{item.expiresAt ?? "—"}</td><td className="min-w-[250px] px-4 py-3"><form action={movement} className="flex items-center gap-1.5"><input type="hidden" name="itemId" value={item.id} /><select name="kind" className={`${inputClass} h-8`}><option value="RECEIVE">Receive</option><option value="USE">Use</option><option value="WASTE">Waste</option><option value="ADJUST">Adjust +</option></select><input name="quantity" aria-label={`Quantity for ${item.name}`} type="number" step="0.01" min="0.01" required className={`${inputClass} h-8 w-20`} /><Button type="submit" size="icon" disabled={pending} aria-label={`Record stock movement for ${item.name}`} className="h-8 w-8">{pending ? <span className="text-xs">…</span> : <ArrowDownToLine size={14} />}</Button></form>{item.latestKind && <p className="mt-1 text-[9px] text-slate-400">Last: {item.latestKind.toLowerCase()} · {item.latestAt}</p>}</td></tr>)}{!items.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-400">No inventory items yet. Add your first clinic supply.</td></tr>}</tbody></table></div>{error && <p className="border-t border-slate-100 px-4 py-2 text-xs text-red-600">{error}</p>}</Card>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1 text-[10px] font-medium text-slate-500">{label}{children}</label>; }
function Metric({ label, value, tone = "" }: { label: string; value: string; tone?: string }) { return <Card className="p-4"><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-2 text-lg font-semibold ${tone || "text-slate-900"}`}>{value}</p></Card>; }
function money(value: number) { return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value); }
