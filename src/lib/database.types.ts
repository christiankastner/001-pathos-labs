export type QuestionType = 'multiple_choice' | 'select_all' | 'dropdown' | 'free_text';

export interface ThematicBucket {
  id: number;
  name: string;
  description: string | null;
}

export interface Question {
  id: number;
  bucket_id: number;
  type: QuestionType;
  prompt: string;
  display_order: number;
  required: boolean;
}

export interface Option {
  id: number;
  question_id: number;
  label: string;
  value: string;
  display_order: number;
}

export interface Session {
  id: string; // UUID
  created_at: string;
}

export interface Answer {
  id: number;
  session_id: string;
  question_id: number;
  value: string;
}

// Enriched types used by the app layer

export interface QuestionWithOptions extends Question {
  options: Option[];
}

export interface BucketWithQuestions extends ThematicBucket {
  questions: QuestionWithOptions[];
}

// Insert payloads (omit generated columns)

export type InsertSession = Pick<Session, 'id'>;

export interface InsertAnswer {
  session_id: string;
  question_id: number;
  value: string;
}

// Database schema type consumed by the Supabase client generic

export interface Database {
  public: {
    Tables: {
      thematic_buckets: {
        Row: ThematicBucket;
        Insert: Omit<ThematicBucket, 'id'>;
        Update: Partial<Omit<ThematicBucket, 'id'>>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, 'id'>;
        Update: Partial<Omit<Question, 'id'>>;
      };
      options: {
        Row: Option;
        Insert: Omit<Option, 'id'>;
        Update: Partial<Omit<Option, 'id'>>;
      };
      sessions: {
        Row: Session;
        Insert: InsertSession;
        Update: never;
      };
      answers: {
        Row: Answer;
        Insert: InsertAnswer;
        Update: Partial<InsertAnswer>;
      };
    };
    Enums: {
      question_type: QuestionType;
    };
  };
}
