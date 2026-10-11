export type DiscountType = "NONE" | "SENIOR_CITIZEN" | "PWD" | "CUSTOM";

export interface TaxCalculationInput {
  grossAmount: number;
  isVatRegistered?: boolean;
  isVatInclusive: boolean;
  discountType: DiscountType;
  seniorPwdId?: string | null;
  hmoCoveredAmount?: number;
  customDiscountPercent?: number;
}

export interface TaxCalculation {
  grossAmount: number;
  vatBase: number;
  vatAmount: number;
  discountAmount: number;
  finalPayable: number;
  hmoCoveredAmount: number;
  patientCoPay: number;
  vatExempt: boolean;
}

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculatePhilippineInvoice(input: TaxCalculationInput): TaxCalculation {
  const { grossAmount, isVatInclusive, discountType } = input;
  const isVatRegistered = input.isVatRegistered ?? true;
  if (!Number.isFinite(grossAmount) || grossAmount < 0) throw new Error("Gross amount must be a non-negative number.");
  const protectedDiscount = discountType === "SENIOR_CITIZEN" || discountType === "PWD";
  if (protectedDiscount && !input.seniorPwdId?.trim()) throw new Error("A Senior Citizen or PWD ID is required to apply this discount.");
  const gross = money(grossAmount);
  const vatBase = money(isVatRegistered && isVatInclusive ? gross / 1.12 : gross);
  const vatAmount = !isVatRegistered ? 0 : isVatInclusive ? money(gross - vatBase) : money(vatBase * 0.12);
  const discountBase = protectedDiscount ? vatBase : gross;
  const discountRate = protectedDiscount ? 0.2 : discountType === "CUSTOM" ? Math.min(Math.max(input.customDiscountPercent ?? 0, 0), 100) / 100 : 0;
  const discountAmount = money(discountBase * discountRate);
  const finalPayable = money((protectedDiscount ? vatBase : gross + (isVatInclusive ? 0 : vatAmount)) - discountAmount);
  const hmoCoveredAmount = money(Math.min(Math.max(input.hmoCoveredAmount ?? 0, 0), finalPayable));
  return { grossAmount: gross, vatBase, vatAmount: protectedDiscount ? 0 : vatAmount, discountAmount, finalPayable, hmoCoveredAmount, patientCoPay: money(Math.max(0, finalPayable - hmoCoveredAmount)), vatExempt: protectedDiscount };
}
