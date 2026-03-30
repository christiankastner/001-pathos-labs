import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

function json(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }

  const { id, name } = body as { id?: unknown; name?: unknown };

  if (typeof id !== 'number' || typeof name !== 'string' || !name.trim()) {
    return json({ error: 'id (number) and name (string) are required.' }, 400);
  }

  const { error } = await supabase
    .from('thematic_buckets')
    .update({ name: name.trim() })
    .eq('id', id);

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ ok: true }, 200);
};
