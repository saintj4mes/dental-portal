import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { AuthSession } from "../types";

const COOKIE_NAME = "dental_portal_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  return value;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export async function createSession(input: Omit<AuthSession, "expiresAt">): Promise<void> {
  const jar = await cookies();
  const session: AuthSession = { ...input, expiresAt: Date.now() + MAX_AGE_SECONDS * 1000 };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  jar.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<AuthSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object" || !("expiresAt" in parsed) || typeof parsed.expiresAt !== "number" || parsed.expiresAt <= Date.now()) return null;
    if (!("email" in parsed) || typeof parsed.email !== "string" || !("clinicId" in parsed) || typeof parsed.clinicId !== "string") return null;
    if (!("role" in parsed) || typeof parsed.role !== "string") return null;
    const roles = ["OWNER", "DENTIST", "RECEPTIONIST", "ASSISTANT"];
    if (!roles.includes(parsed.role)) return null;
    return parsed as AuthSession;
  } catch { return null; }
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export function isAuthenticationConfigured(): boolean {
  return Boolean(process.env.AUTH_EMAIL && process.env.AUTH_PASSWORD && process.env.AUTH_CLINIC_ID && process.env.SESSION_SECRET);
}
