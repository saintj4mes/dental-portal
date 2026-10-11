import { PortalShell } from "@/shared/components/portal-shell";
import { redirect } from "next/navigation";
import { getSession, isAuthenticationConfigured } from "@/modules/auth/lib/session";
import { getClinicId } from "@/shared/lib/clinic-context";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && !isAuthenticationConfigured()) redirect("/login");
  if (isAuthenticationConfigured() && !await getSession()) redirect("/login");
  const demoBranchId = process.env.NODE_ENV !== "production" && process.env.DEMO_MODE !== "false" && !isAuthenticationConfigured() ? await getClinicId() : undefined;
  return <PortalShell demoBranchId={demoBranchId}>{children}</PortalShell>;
}
