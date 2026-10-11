import type { ZodSchema } from "zod";

export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export function createSafeAction<TInput, TOutput>(
  schema: ZodSchema<TInput>,
  handler: (validatedData: TInput) => Promise<TOutput>,
): (data: unknown) => Promise<ActionResponse<TOutput>> {
  return async (data: unknown) => {
    try {
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
      }
      return { success: true, data: await handler(parsed.data) };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "An unexpected server error occurred" };
    }
  };
}
