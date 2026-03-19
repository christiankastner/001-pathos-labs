import { createClient } from '@supabase/supabase-js';
import type { Database, BucketWithQuestions, InsertAnswer } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL as string;
const supabaseKey = import.meta.env.SUPABASE_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Fetch a single bucket with its questions and options, ordered for display
export async function getBucket(bucketId: number): Promise<BucketWithQuestions | null> {
  const { data: bucket, error: bucketError } = await supabase
    .from('thematic_buckets')
    .select('*')
    .eq('id', bucketId)
    .single();

  if (bucketError || !bucket) return null;

  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*, options(*)')
    .eq('bucket_id', bucketId)
    .order('display_order', { ascending: true });

  if (questionsError || !questions) return null;

  const questionsWithOptions = questions.map((q) => ({
    ...q,
    options: (q.options ?? []).sort((a, b) => a.display_order - b.display_order),
  }));

  return { ...bucket, questions: questionsWithOptions };
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
