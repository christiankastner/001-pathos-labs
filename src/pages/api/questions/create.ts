import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import type { QuestionType } from '../../../lib/database.types';

const VALID_TYPES: QuestionType[] = ['multiple_choice', 'select_all', 'dropdown', 'free_text'];

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

  const { bucket_id, prompt, type, options } = body as {
    bucket_id: number;
    prompt: string;
    type: QuestionType;
    options: Array<{ label: string; value: string }>;
  };

  if (!bucket_id || typeof prompt !== 'string' || !prompt.trim()) {
    return json({ error: 'bucket_id and prompt are required.' }, 400);
  }

  if (!VALID_TYPES.includes(type)) {
    return json({ error: 'Invalid question type.' }, 400);
  }

  const needsOptions = type !== 'free_text';
  if (needsOptions && (!Array.isArray(options) || options.length === 0)) {
    return json({ error: 'Options required for this question type.' }, 400);
  }

  // Determine next display_order for this bucket
  const { data: existing } = await supabase
    .from('questions')
    .select('display_order')
    .eq('bucket_id', bucket_id)
    .order('display_order', { ascending: false })
    .limit(1);

  const display_order = ((existing?.[0] as { display_order: number } | undefined)?.display_order ?? 0) + 1;

  // Insert question
  const { data: newQuestion, error: insertError } = await supabase
    .from('questions')
    .insert({ bucket_id, type, prompt: prompt.trim(), display_order, required: true })
    .select()
    .single();

  if (insertError || !newQuestion) {
    return json({ error: insertError?.message ?? 'Failed to create question.' }, 500);
  }

  const q = newQuestion as { id: number; bucket_id: number; type: string; prompt: string; display_order: number; required: boolean; is_active: boolean };

  // Insert options if needed
  if (needsOptions && Array.isArray(options) && options.length > 0) {
    const insertRows = options
      .filter((o) => o.label?.trim() && o.value?.trim())
      .map((opt, i) => ({
        question_id: q.id,
        label: opt.label.trim(),
        value: opt.value.trim(),
        display_order: i + 1,
      }));

    if (insertRows.length === 0) {
      return json({ error: 'No valid options provided.' }, 400);
    }

    const { error: optInsertError } = await supabase.from('options').insert(insertRows);

    if (optInsertError) {
      return json({ error: optInsertError.message }, 500);
    }

    return json({ ok: true, question: q, options: insertRows }, 201);
  }

  return json({ ok: true, question: q, options: [] }, 201);
};
