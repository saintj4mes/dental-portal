export interface AuthSession {
  email: string;
  clinicId: string;
  role: "OWNER" | "DENTIST" | "RECEPTIONIST" | "ASSISTANT";
  expiresAt: number;
}
