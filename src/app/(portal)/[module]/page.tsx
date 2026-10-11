import { notFound } from "next/navigation";
import { WorkspaceModule } from "@/modules/workspace/components/WorkspaceModule";
import { db } from "@/shared/db";
import { getClinicId } from "@/shared/lib/clinic-context";
import { isWorkspaceModuleKey } from "@/shared/lib/workspace-modules";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!isWorkspaceModuleKey(module)) notFound();
  const records = await db.workspaceRecord.findMany({
    where: { clinicId: await getClinicId(), module },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
  });
  return <WorkspaceModule module={module} records={records.map((record) => ({
    id: record.id,
    title: record.title,
    details: record.details,
    reference: record.reference,
    status: record.status,
    amount: record.amount === null ? null : Number(record.amount),
    dueAt: record.dueAt?.toISOString().slice(0, 10) ?? null,
    createdAt: record.createdAt.toISOString(),
  }))} />;
}
