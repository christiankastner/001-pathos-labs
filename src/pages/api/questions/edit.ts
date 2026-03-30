import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import type { QuestionType } from '../../../lib/database.types';

const VALID_TYPES: QuestionType[] = ['multiple_choice', 'select_all', 'dropdown', 'free_text'];

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON.' }), { status: 400 });
  }

  const { id, bucket_id, prompt, type, options } = body as {
    id: number;
    bucket_id?: number;
    prompt: string;
    type: QuestionType;
    options: Array<{ label: string; value: string }>;
  };

  if (!id || typeof prompt !== 'string' || !prompt.trim()) {
    return new Response(JSON.stringify({ error: 'Invalid question data.' }), { status: 400 });
  }

  if (!VALID_TYPES.includes(type)) {
    return new Response(JSON.stringify({ error: 'Invalid question type.' }), { status: 400 });
  }

  const needsOptions = type !== 'free_text';
  if (needsOptions && (!Array.isArray(options) || options.length === 0)) {
    return new Response(JSON.stringify({ error: 'Options required for this question type.' }), { status: 400 });
  }

  // Update question
  const update: Record<string, unknown> = { prompt: prompt.trim(), type };
  if (bucket_id) update.bucket_id = bucket_id;

  const { error: updateError } = await supabase
    .from('questions')
    .update(update)
    .eq('id', id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }

  // Replace options: delete all existing, then insert new ones
  const { error: deleteError } = await supabase
    .from('options')
    .delete()
    .eq('question_id', id);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
  }

  if (needsOptions && Array.isArray(options) && options.length > 0) {
    const insertRows = options
      .filter((o) => o.label?.trim() && o.value?.trim())
      .map((opt, i) => ({
        question_id: id,
        label: opt.label.trim(),
        value: opt.value.trim(),
        display_order: i + 1,
      }));

    if (insertRows.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid options provided.' }), { status: 400 });
    }

    const { error: insertError } = await supabase.from('options').insert(insertRows);

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
