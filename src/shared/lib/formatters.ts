export const formatPHP = (amount: number | string) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 }).format(Number(amount));

export const formatDate = (value: Date | string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila", ...options }).format(new Date(value));

export const formatTime = (value: Date | string) =>
  new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Manila" }).format(new Date(value));

export function normalizePhMobile(value: string): string {
  const digits = value.replace(/[^\d+]/g, "");
  const local = digits.startsWith("+63") ? `0${digits.slice(3)}` : digits.startsWith("63") ? `0${digits.slice(2)}` : digits;
  if (!/^09\d{9}$/.test(local)) throw new Error("Mobile number must use Philippine format 09XXXXXXXXX or +639XXXXXXXXX.");
  return local;
}

export const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
