import { z, ZodError, type ZodTypeAny } from 'zod';
import { apiError } from '@/lib/api-response';

export async function parseJsonBody<TSchema extends ZodTypeAny>(
  req: Request,
  schema: TSchema,
  requestId: string,
): Promise<{ data: z.infer<TSchema> } | { response: ReturnType<typeof apiError> }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { response: apiError(requestId, 'invalid_json', 400) };
  }

  try {
    return { data: schema.parse(body) };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        response: apiError(requestId, 'validation_failed', 400, {
          issues: err.issues,
        }),
      };
    }
    return { response: apiError(requestId, 'validation_failed', 400) };
  }
}
