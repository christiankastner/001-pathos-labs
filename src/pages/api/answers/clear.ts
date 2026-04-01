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

  const { question_id } = body as { question_id?: unknown };

  if (typeof question_id !== 'number') {
    return json({ error: 'question_id (number) is required.' }, 400);
  }

  const { error, count } = await supabase
    .from('answers')
    .delete({ count: 'exact' })
    .eq('question_id', question_id);

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ ok: true, deleted: count ?? 0 }, 200);
};
