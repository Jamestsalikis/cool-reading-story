import { z } from 'zod';

// Reusable primitives
const uuid = z.string().uuid('Must be a valid UUID');
const pageNumber = z.number().int().min(1).max(5);

// ── Route schemas ──────────────────────────────────────────────────────────

export const generateStorySchema = z.object({
  child_id: uuid,
});

export const generateSequelSchema = z.object({
  story_id: uuid,
});

export const generateImageSchema = z.object({
  story_id: uuid,
  page_number: pageNumber,
});

export const pollImageSchema = z.object({
  story_id: uuid,
  page_number: pageNumber,
  poll_url: z.string().url().startsWith('https://api.replicate.com'),
});

export const startImagesSchema = z.object({
  story_id: uuid,
});

export const generateAllImagesSchema = z.object({
  story_id: uuid,
});

export const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'annual', 'extra_book', 'extra_child']),
  locale: z.string().max(20).optional().default('en-AU'),
  continue_story_id: z.string().uuid().optional(),
});

// ── Helper ─────────────────────────────────────────────────────────────────

/** Parse and validate a request body. Returns { data } or throws a 400 Response. */
export async function parseBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Response(
      JSON.stringify({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return result.data;
}
