"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { purchaseOrderSchema, receiveOrderLineSchema, supplierSchema } from "../schemas/procurement";

const supplierAction = createSafeAction(supplierSchema, async (input) => {
  const clinicId = await getClinicId();
  const supplier = await db.supplier.create({ data: { clinicId, name: input.name, contactName: input.contactName || null, mobileNumber: input.mobileNumber || null, email: input.email || null, tin: input.tin || null, address: input.address || null }, select: { id: true } });
  revalidatePath("/procurement");
  return supplier;
});
const createOrderAction = createSafeAction(purchaseOrderSchema, async (input) => {
  const clinicId = await getClinicId();
  const itemIds = [...new Set(input.lines.map((line) => line.itemId))];
  const [supplier, items] = await Promise.all([db.supplier.findFirst({ where: { id: input.supplierId, clinicId, active: true }, select: { id: true } }), db.inventoryItem.findMany({ where: { id: { in: itemIds }, clinicId, active: true }, select: { id: true } })]);
  if (!supplier) throw new Error("Supplier was not found in this clinic.");
  if (items.length !== itemIds.length) throw new Error("One or more inventory items are unavailable.");
  const order = await db.$transaction(async (tx) => {
    const sequence = await tx.clinic.update({ where: { id: clinicId }, data: { currentPurchaseOrderNumber: { increment: 1 } }, select: { currentPurchaseOrderNumber: true } });
    return tx.purchaseOrder.create({ data: { clinicId, supplierId: supplier.id, orderNumber: `PO-${String(sequence.currentPurchaseOrderNumber).padStart(6, "0")}`, status: "ORDERED", expectedAt: input.expectedAt ? new Date(`${input.expectedAt}T00:00:00.000Z`) : null, notes: input.notes || null, lines: { create: input.lines } }, select: { id: true, orderNumber: true } });
  });
  revalidatePath("/procurement");
  return order;
});
const receiveAction = createSafeAction(receiveOrderLineSchema, async (input) => {
  const clinicId = await getClinicId();
  await db.$transaction(async (tx) => {
    const line = await tx.purchaseOrderLine.findFirst({ where: { id: input.lineId, order: { clinicId, status: { in: ["ORDERED", "PART_RECEIVED"] } } }, include: { order: true, item: true } });
    if (!line) throw new Error("Open purchase order line was not found.");
    const remaining = Number(line.quantityOrdered) - Number(line.quantityReceived);
    if (input.quantity > remaining) throw new Error(`Only ${remaining} ${line.item.unit} remain unreceived.`);
    await tx.purchaseOrderLine.update({ where: { id: line.id }, data: { quantityReceived: { increment: input.quantity } } });
    await tx.inventoryItem.update({ where: { id: line.itemId }, data: { quantityOnHand: { increment: input.quantity }, unitCost: line.unitCost } });
    await tx.stockMovement.create({ data: { clinicId, itemId: line.itemId, kind: "RECEIVE", quantity: input.quantity, unitCost: line.unitCost, reference: input.reference || line.order.orderNumber, note: `Received against ${line.order.orderNumber}` } });
    const orderLines = await tx.purchaseOrderLine.findMany({ where: { orderId: line.orderId }, select: { quantityOrdered: true, quantityReceived: true } });
    const complete = orderLines.every((orderLine) => Number(orderLine.quantityReceived) >= Number(orderLine.quantityOrdered));
    await tx.purchaseOrder.update({ where: { id: line.orderId }, data: { status: complete ? "RECEIVED" : "PART_RECEIVED", receivedAt: complete ? new Date() : null } });
  });
  revalidatePath("/procurement"); revalidatePath("/inventory");
  return { received: true };
});
export async function createSupplier(input: unknown) { return supplierAction(input); }
export async function createPurchaseOrder(input: unknown) { return createOrderAction(input); }
export async function receivePurchaseOrderLine(input: unknown) { return receiveAction(input); }
