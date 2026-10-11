import { z } from "zod";
export const chairSchema = z.object({ name: z.string().trim().min(2).max(100), isActive: z.boolean().default(true) });
