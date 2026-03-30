import { createClient } from '@supabase/supabase-js';
import type { Question, Option, QuestionWithOptions, ThematicBucket, InsertAnswer } from './database.types';

export interface ResponseRow {
  session_id: string;
  question_id: number;
  question_prompt: string;
  display_order: number;
  value: string;
  value_label: string; // human-readable label for choice types; raw text for free_text
}

const supabaseUrl = import.meta.env.SUPABASE_URL as string;
const supabaseKey = import.meta.env.SUPABASE_KEY as string;

// createClient is untyped here because our hand-crafted Database interfaces don't
// carry index signatures, which Supabase v2's GenericTable constraint requires.
// All query results are cast to our explicit app-layer types at the call site.
export const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all thematic buckets ordered by id
export async function getAllBuckets(): Promise<ThematicBucket[]> {
  const { data } = await supabase
    .from('thematic_buckets')
    .select('*')
    .order('id');

  return (data ?? []) as ThematicBucket[];
}

// Fetch all questions ordered by id
export async function getAllQuestions(): Promise<Question[]> {
  const { data } = await supabase
    .from('questions')
    .select('*')
    .order('id');

  return (data ?? []) as Question[];
}

// Fetch all questions with their options, ordered by id
export async function getAllQuestionsWithOptions(): Promise<QuestionWithOptions[]> {
  const [{ data: questions }, { data: options }] = await Promise.all([
    supabase.from('questions').select('*').order('id'),
    supabase.from('options').select('*').order('display_order'),
  ]);

  const optionsByQuestion = new Map<number, Option[]>();
  for (const opt of (options ?? []) as Option[]) {
    const list = optionsByQuestion.get(opt.question_id) ?? [];
    list.push(opt);
    optionsByQuestion.set(opt.question_id, list);
  }

  return ((questions ?? []) as Question[]).map((q) => ({
    ...q,
    options: optionsByQuestion.get(q.id) ?? [],
  }));
}

// Fetch the currently active question with its options
export async function getActiveQuestion(): Promise<QuestionWithOptions | null> {
  const { data: question, error } = await supabase
    .from('questions')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error || !question) return null;

  const { data: options } = await supabase
    .from('options')
    .select('*')
    .eq('question_id', question.id)
    .order('display_order');

  return {
    ...(question as Question),
    options: ((options ?? []) as Option[]).sort((a, b) => a.display_order - b.display_order),
  };
}

// Upsert a session record (idempotent — safe to call if session already exists)
export async function upsertSession(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('sessions')
    .upsert({ id: sessionId }, { onConflict: 'id', ignoreDuplicates: true });

  return !error;
}

// Write all answers for a session in a single batch upsert
export async function submitAnswers(answers: InsertAnswer[]): Promise<boolean> {
  const { error } = await supabase
    .from('answers')
    .upsert(answers, { onConflict: 'session_id,question_id' });

  return !error;
}

// Lookup maps needed by the browser client for resolving realtime payloads.
// Returned as plain JSON-serialisable objects so the page can embed them inline.
export interface LookupMaps {
  questionPrompts: Record<number, string>;
  questionTypes: Record<number, string>;
  optionLabels: Record<string, string>; // key: "<question_id>:<option_value>"
}

export async function getLookupMaps(): Promise<LookupMaps> {
  const [{ data: questions }, { data: options }] = await Promise.all([
    supabase.from('questions').select('id,prompt,type'),
    supabase.from('options').select('question_id,value,label'),
  ]);

  const questionPrompts: Record<number, string> = {};
  const questionTypes: Record<number, string> = {};
  for (const q of (questions ?? []) as { id: number; prompt: string; type: string }[]) {
    questionPrompts[q.id] = q.prompt;
    questionTypes[q.id] = q.type;
  }

  const optionLabels: Record<string, string> = {};
  for (const opt of (options ?? []) as { question_id: number; value: string; label: string }[]) {
    optionLabels[`${opt.question_id}:${opt.value}`] = opt.label;
  }

  return { questionPrompts, questionTypes, optionLabels };
}

// Fetch all answers across all questions, with option labels resolved for display
export async function getResponses(): Promise<ResponseRow[]> {
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .order('id');

  if (!questions || !questions.length) return [];

  const questionIds = (questions as Question[]).map((q) => q.id);

  const { data: options } = await supabase
    .from('options')
    .select('*')
    .in('question_id', questionIds);

  const optionLabelMap = new Map<string, string>();
  for (const opt of (options ?? []) as Option[]) {
    optionLabelMap.set(`${opt.question_id}:${opt.value}`, opt.label);
  }

  const questionMap = new Map((questions as Question[]).map((q) => [q.id, q]));

  const { data: answers } = await supabase
    .from('answers')
    .select('*')
    .in('question_id', questionIds)
    .order('session_id');

  if (!answers) return [];

  return (answers as { session_id: string; question_id: number; value: string; id: number }[]).map((a) => {
    const question = questionMap.get(a.question_id)!;
    const value_label =
      question.type === 'free_text'
        ? a.value
        : a.value
            .split(',')
            .map((v) => optionLabelMap.get(`${a.question_id}:${v}`) ?? v)
            .join(', ');

    return {
      session_id: a.session_id,
      question_id: a.question_id,
      question_prompt: question.prompt,
      display_order: question.display_order,
      value: a.value,
      value_label,
    };
  });
}
