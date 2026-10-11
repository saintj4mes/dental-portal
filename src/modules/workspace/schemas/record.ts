import { z } from "zod";
import { workspaceModules } from "@/shared/lib/workspace-modules";

const moduleKeys = Object.keys(workspaceModules) as [keyof typeof workspaceModules, ...(keyof typeof workspaceModules)[]];

export const workspaceRecordSchema = z.object({
  module: z.enum(moduleKeys),
  title: z.string().trim().min(2).max(180),
  details: z.string().trim().max(2000).optional().default(""),
  reference: z.string().trim().max(100).optional().default(""),
  status: z.string().max(32),
  amount: z.coerce.number().min(0).max(999999999).optional(),
  dueAt: z.string().optional(),
});

export const workspaceStatusSchema = z.object({
  id: z.string().uuid(),
  module: z.enum(moduleKeys),
  status: z.string().max(32),
});
