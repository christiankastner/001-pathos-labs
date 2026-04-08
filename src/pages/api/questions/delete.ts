import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON.' }), { status: 400 });
  }

  const { id } = body as { id: number };

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing question id.' }), { status: 400 });
  }

  // Delete options first (foreign key)
  const { error: optionsError } = await supabase
    .from('options')
    .delete()
    .eq('question_id', id);

  if (optionsError) {
    return new Response(JSON.stringify({ error: optionsError.message }), { status: 500 });
  }

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
