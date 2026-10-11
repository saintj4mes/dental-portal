import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { InventoryWorkspace } from "@/modules/inventory/components/InventoryWorkspace";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const clinicId = await getClinicId();
  const items = await db.inventoryItem.findMany({ where: { clinicId, active: true }, include: { movements: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: [{ category: "asc" }, { name: "asc" }] });
  return <InventoryWorkspace items={items.map((item) => ({ id: item.id, sku: item.sku, name: item.name, category: item.category, unit: item.unit, quantity: Number(item.quantityOnHand), reorderLevel: Number(item.reorderLevel), unitCost: item.unitCost === null ? null : Number(item.unitCost), expiresAt: item.expiresAt?.toISOString().slice(0, 10) ?? null, latestKind: item.movements[0]?.kind ?? null, latestAt: item.movements[0]?.createdAt.toLocaleDateString("en-PH", { month: "short", day: "numeric" }) ?? null }))} />;
}
