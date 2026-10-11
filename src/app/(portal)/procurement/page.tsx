import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { ProcurementWorkspace } from "@/modules/procurement/components/ProcurementWorkspace";

export const dynamic = "force-dynamic";

export default async function ProcurementPage() {
  const clinicId = await getClinicId();
  const [suppliers, items, orders] = await Promise.all([
    db.supplier.findMany({ where: { clinicId, active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.inventoryItem.findMany({ where: { clinicId, active: true }, select: { id: true, name: true, unit: true, unitCost: true }, orderBy: { name: "asc" } }),
    db.purchaseOrder.findMany({ where: { clinicId }, include: { supplier: { select: { name: true } }, lines: { include: { item: { select: { name: true, unit: true } } } } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return <ProcurementWorkspace suppliers={suppliers} items={items.map((item) => ({ ...item, unitCost: item.unitCost === null ? null : Number(item.unitCost) }))} orders={orders.map((order) => ({ id: order.id, number: order.orderNumber, supplier: order.supplier.name, status: order.status, expectedAt: order.expectedAt?.toISOString().slice(0, 10) ?? null, createdAt: order.createdAt.toLocaleDateString("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" }), lines: order.lines.map((line) => ({ id: line.id, itemId: line.itemId, itemName: line.item.name, unit: line.item.unit, ordered: Number(line.quantityOrdered), received: Number(line.quantityReceived), unitCost: Number(line.unitCost) })) }))} />;
}
