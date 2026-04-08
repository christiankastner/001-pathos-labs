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

  const { id, name, display_order, yes_color, no_color } = body as {
    id?: unknown; name?: unknown; display_order?: unknown; yes_color?: unknown; no_color?: unknown;
  };

  if (typeof id !== 'number' || typeof name !== 'string' || !name.trim()) {
    return json({ error: 'id (number) and name (string) are required.' }, 400);
  }

  const update: Record<string, unknown> = { name: name.trim() };
  if (typeof display_order === 'number') update.display_order = display_order;
  if (typeof yes_color === 'string' && /^#[0-9a-fA-F]{6}$/.test(yes_color)) update.yes_color = yes_color;
  if (typeof no_color  === 'string' && /^#[0-9a-fA-F]{6}$/.test(no_color))  update.no_color  = no_color;

  const { error } = await supabase
    .from('thematic_buckets')
    .update(update)
    .eq('id', id);

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ ok: true }, 200);
};
