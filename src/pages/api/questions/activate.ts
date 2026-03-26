import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { id, active } = body as { id?: unknown; active?: unknown };

  if (typeof id !== 'number' || typeof active !== 'boolean') {
    return json({ error: 'id (number) and active (boolean) are required' }, 400);
  }

  const { error } = await supabase
    .from('questions')
    .update({ is_active: active })
    .eq('id', id);

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ ok: true }, 200);
};

function json(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
