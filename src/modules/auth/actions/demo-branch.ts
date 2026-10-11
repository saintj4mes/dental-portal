"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "@/modules/auth/lib/session";
import { ensureDemoWorkspace } from "@/shared/db/demo-seed";
import { demoBranchCookie, demoBranches } from "@/shared/lib/demo-branches";

export async function switchDemoBranch(branchId: string): Promise<void> {
  if (process.env.NODE_ENV === "production" || process.env.DEMO_MODE === "false") {
    throw new Error("Demo branch switching is only available in the local demo workspace.");
  }
  if (await getSession()) throw new Error("Branch switching is unavailable for signed-in clinic sessions.");
  const branch = demoBranches.find((entry) => entry.id === branchId);
  if (!branch) throw new Error("Choose one of the available demo branches.");

  await ensureDemoWorkspace(branch.id);
  (await cookies()).set(demoBranchCookie, branch.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/", "layout");
}
