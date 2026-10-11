"use server";

import { createSession, clearSession } from "../lib/session";
import { createSafeAction } from "@/shared/lib/action-client";
import { loginSchema } from "../schemas/login";

const loginAction = createSafeAction(loginSchema, async ({ email, password }) => {
  const expectedEmail = process.env.AUTH_EMAIL;
  const expectedPassword = process.env.AUTH_PASSWORD;
  const clinicId = process.env.AUTH_CLINIC_ID ?? process.env.DEMO_CLINIC_ID;
  if (!expectedEmail || !expectedPassword || !clinicId) throw new Error("Authentication is not configured for this deployment.");
  if (email.toLowerCase() !== expectedEmail.toLowerCase() || password !== expectedPassword) throw new Error("Email or password is incorrect.");
  await createSession({ email: expectedEmail, clinicId, role: "OWNER" });
  return { redirectTo: "/dashboard" };
});

export async function login(input: unknown) { return loginAction(input); }

export async function logout() {
  await clearSession();
  return { success: true as const, data: null };
}
