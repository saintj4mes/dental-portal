import "server-only";
import { cookies } from "next/headers";
import { getSession } from "@/modules/auth/lib/session";
import { demoClinicId, ensureDemoWorkspace } from "@/shared/db/demo-seed";
import { demoBranchCookie, demoBranches } from "@/shared/lib/demo-branches";

export async function getClinicId(): Promise<string> {
  const session = await getSession();
  if (session) return session.clinicId;
  if (process.env.NODE_ENV !== "production" && process.env.DEMO_MODE !== "false") {
    const selectedBranchId = (await cookies()).get(demoBranchCookie)?.value;
    const selectedBranch = demoBranches.find((branch) => branch.id === selectedBranchId);
    const clinicId = selectedBranch?.id ?? process.env.DEMO_CLINIC_ID ?? demoClinicId;
    await ensureDemoWorkspace(clinicId);
    return clinicId;
  }
  throw new Error("Sign in to access this clinic.");
}
