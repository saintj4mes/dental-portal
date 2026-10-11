"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { inventoryItemSchema, stockMovementSchema } from "../schemas/inventory";

const createItemAction = createSafeAction(inventoryItemSchema, async (input) => {
  const clinicId = await getClinicId();
  await db.$transaction(async (tx) => {
    const item = await tx.inventoryItem.create({ data: { clinicId, sku: input.sku || null, name: input.name, category: input.category, unit: input.unit, quantityOnHand: input.quantity, reorderLevel: input.reorderLevel, unitCost: input.unitCost ?? null, expiresAt: input.expiresAt ? new Date(`${input.expiresAt}T00:00:00.000Z`) : null } });
    if (input.quantity > 0) await tx.stockMovement.create({ data: { clinicId, itemId: item.id, kind: "OPENING", quantity: input.quantity, unitCost: input.unitCost ?? null, reference: "OPENING STOCK", note: "Opening balance at item setup" } });
  });
  revalidatePath("/inventory");
  return { saved: true };
});

const recordMovementAction = createSafeAction(stockMovementSchema, async (input) => {
  const clinicId = await getClinicId();
  await db.$transaction(async (tx) => {
    const item = await tx.inventoryItem.findFirst({ where: { id: input.itemId, clinicId, active: true }, select: { id: true, quantityOnHand: true, unitCost: true } });
    if (!item) throw new Error("Inventory item was not found.");
    const current = Number(item.quantityOnHand);
    const isIncrease = input.kind === "RECEIVE" || input.kind === "ADJUST";
    if (!isIncrease && input.quantity > current) throw new Error("This movement cannot reduce stock below zero.");
    const change = isIncrease ? input.quantity : -input.quantity;
    await tx.stockMovement.create({ data: { clinicId, itemId: item.id, kind: input.kind, quantity: change, unitCost: item.unitCost, reference: input.reference || null, note: input.note || null } });
    await tx.inventoryItem.update({ where: { id: item.id }, data: { quantityOnHand: { increment: change } } });
  });
  revalidatePath("/inventory");
  return { saved: true };
});

export async function createInventoryItem(input: unknown) { return createItemAction(input); }
export async function recordStockMovement(input: unknown) { return recordMovementAction(input); }
