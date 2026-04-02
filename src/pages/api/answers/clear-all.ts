import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

function json(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async () => {
  const { error, count } = await supabase
    .from('answers')
    .delete({ count: 'exact' })
    .neq('id', 0);

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ ok: true, deleted: count ?? 0 }, 200);
};
