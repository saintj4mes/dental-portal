"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { createSafeAction } from "@/shared/lib/action-client";
import { z } from "zod";

const paymentSchema = z.object({ invoiceId: z.string().uuid(), amount: z.number().positive(), method: z.enum(["CASH", "GCASH", "MAYA", "BANK_TRANSFER", "CARD"]), referenceNumber: z.string().trim().max(100).optional() });
const recordPaymentAction = createSafeAction(paymentSchema, async (input) => {
  const clinicId = await getClinicId();
  const result = await db.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({ where: { id: input.invoiceId, clinicId }, include: { payments: true, clinic: true } });
    if (!invoice) throw new Error("Invoice was not found.");
    const paid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const remaining = Math.max(0, Number(invoice.patientDueAmount) - paid);
    if (input.amount > remaining) throw new Error("Payment exceeds the remaining patient balance.");
    const receiptCount = invoice.clinic.currentReceiptNumber + 1;
    await tx.clinic.update({ where: { id: clinicId }, data: { currentReceiptNumber: { increment: 1 } } });
    const orNumber = `${invoice.clinic.officialReceiptPrefix}-${String(receiptCount).padStart(8, "0")}`;
    const payment = await tx.payment.create({ data: { clinicId, invoiceId: invoice.id, amount: input.amount, paymentMethod: input.method, referenceNumber: input.referenceNumber || null, orNumber } });
    const newPaid = paid + input.amount;
    await tx.invoice.update({ where: { id: invoice.id }, data: { paymentStatus: newPaid >= Number(invoice.patientDueAmount) ? "PAID" : "PARTIAL" } });
    return payment;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  revalidatePath("/billing");
  revalidatePath("/payments");
  return { id: result.id, orNumber: result.orNumber };
});

export async function recordPayment(input: unknown) {
  return recordPaymentAction(input);
}
