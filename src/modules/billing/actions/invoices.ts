"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { z } from "zod";
import { calculatePhilippineInvoice } from "../lib/tax-calculator";
import { invoiceSchema } from "../schemas/invoice";

const createInvoiceAction = createSafeAction(invoiceSchema, async (input) => {
  const clinicId = await getClinicId();
  const patient = await db.patient.findFirst({ where: { id: input.patientId, clinicId } });
  if (!patient) throw new Error("Patient record was not found in this clinic.");
  const clinic = await db.clinic.findUnique({ where: { id: clinicId }, select: { isVatRegistered: true } });
  if (!clinic) throw new Error("Clinic record was not found.");
  if (input.appointmentId) {
    const appointment = await db.appointment.findFirst({ where: { id: input.appointmentId, clinicId, patientId: patient.id }, select: { id: true } });
    if (!appointment) throw new Error("Appointment does not belong to this patient and clinic.");
  }
  const calculatedSubtotal = Math.round(input.lineItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0) * 100) / 100;
  if (Math.abs(calculatedSubtotal - input.subtotal) > 0.01) throw new Error("Invoice line items must match the subtotal.");
  const computation = calculatePhilippineInvoice({ grossAmount: input.subtotal, isVatRegistered: clinic.isVatRegistered, isVatInclusive: input.isVatInclusive, discountType: input.discountType, seniorPwdId: input.seniorPwdId, customDiscountPercent: input.customDiscountPercent, hmoCoveredAmount: input.hmoCoveredAmount });
  if ((input.hmoCoveredAmount ?? 0) > 0 && !input.hmoProvider?.trim()) throw new Error("Select an HMO provider when entering a covered amount.");
  const invoice = await db.$transaction(async (tx) => {
    const clinic = await tx.clinic.update({ where: { id: clinicId }, data: { currentInvoiceNumber: { increment: 1 } }, select: { currentInvoiceNumber: true } });
    const nextNumber = clinic.currentInvoiceNumber;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(nextNumber).padStart(4, "0")}`;
    return tx.invoice.create({ data: {
      clinicId, patientId: input.patientId, appointmentId: input.appointmentId || null, invoiceNumber,
      subtotal: computation.grossAmount, isVatInclusive: input.isVatInclusive, vatAmount: computation.vatAmount,
      discountType: input.discountType, discountAmount: computation.discountAmount,
      seniorPwdIdSnapshot: input.seniorPwdId?.trim() || null, hmoProvider: input.hmoProvider?.trim() || null,
      hmoApprovalCode: input.hmoApprovalCode?.trim() || null, hmoCoveredAmount: computation.hmoCoveredAmount,
      hmoClaimStatus: input.hmoProvider?.trim() ? input.hmoApprovalCode?.trim() ? "APPROVED" : "PENDING" : null,
      hmoSubmittedAt: input.hmoProvider?.trim() ? new Date() : null,
      patientDueAmount: computation.patientCoPay,
      lineItems: { create: input.lineItems.map((item) => ({ ...item, total: Math.round(item.quantity * item.unitPrice * 100) / 100 })) },
    } });
  });
  revalidatePath("/billing");
  return { id: invoice.id, invoiceNumber: invoice.invoiceNumber, due: computation.patientCoPay };
});

export async function createInvoice(input: unknown) {
  return createInvoiceAction(input);
}

const hmoClaimSchema = z.object({ invoiceId: z.string().uuid(), status: z.enum(["PENDING", "APPROVED", "DENIED", "REIMBURSED"]), provider: z.string().trim().min(1).max(100), approvalCode: z.string().trim().max(100).optional(), coveredAmount: z.number().min(0) });
const updateHmoClaimAction = createSafeAction(hmoClaimSchema, async (input) => {
  const clinicId = await getClinicId();
  const invoice = await db.invoice.findFirst({ where: { id: input.invoiceId, clinicId }, include: { payments: { select: { id: true } } } });
  if (!invoice) throw new Error("Invoice was not found in this clinic.");
  if (invoice.payments.length > 0) throw new Error("HMO coverage cannot change after patient payments have been recorded.");
  if (input.status === "APPROVED" && !input.approvalCode?.trim()) throw new Error("Approval code is required for an approved HMO claim.");
  const finalPayable = Number(invoice.patientDueAmount) + Number(invoice.hmoCoveredAmount);
  const coveredAmount = input.status === "APPROVED" ? Math.min(input.coveredAmount, finalPayable) : 0;
  await db.invoice.update({ where: { id: invoice.id }, data: { hmoProvider: input.provider, hmoApprovalCode: input.approvalCode?.trim() || null, hmoClaimStatus: input.status, hmoCoveredAmount: coveredAmount, hmoSubmittedAt: new Date(), patientDueAmount: Math.max(0, finalPayable - coveredAmount) } });
  revalidatePath("/billing");
  return { id: invoice.id };
});
export async function updateHmoClaim(input: unknown) { return updateHmoClaimAction(input); }
