-- Phase 1: Initial schema for Pathos Labs survey system

-- Question type enum
create type question_type as enum (
  'multiple_choice',
  'select_all',
  'dropdown',
  'free_text'
);

-- Thematic buckets: top-level grouping for questions
create table thematic_buckets (
  id   bigint generated always as identity primary key,
  name text not null,
  description text
);

-- Questions belong to a thematic bucket (max 3 per bucket enforced at app layer)
create table questions (
  id            bigint generated always as identity primary key,
  bucket_id     bigint not null references thematic_buckets (id) on delete cascade,
  type          question_type not null,
  prompt        text not null,
  display_order int not null default 0,
  required      boolean not null default false
);

create index questions_bucket_id_idx on questions (bucket_id);

-- Options for choice-based question types (multiple_choice, select_all, dropdown)
create table options (
  id            bigint generated always as identity primary key,
  question_id   bigint not null references questions (id) on delete cascade,
  label         text not null,
  value         text not null,
  display_order int not null default 0
);

create index options_question_id_idx on options (question_id);

-- Anonymous survey sessions; id is a UUID generated client-side and stored in localStorage
create table sessions (
  id         uuid primary key,
  created_at timestamptz not null default now()
);

-- One answer row per question per session
-- value stores free text directly, or option id(s) as comma-separated text for choice types
create table answers (
  id          bigint generated always as identity primary key,
  session_id  uuid not null references sessions (id) on delete cascade,
  question_id bigint not null references questions (id) on delete cascade,
  value       text not null,
  unique (session_id, question_id)
);

create index answers_session_id_idx  on answers (session_id);
create index answers_question_id_idx on answers (question_id);

-- Row Level Security
-- Data is anonymous/public: anon role can read lookup data and write responses

alter table thematic_buckets enable row level security;
alter table questions         enable row level security;
alter table options           enable row level security;
alter table sessions          enable row level security;
alter table answers           enable row level security;

-- Public read access for survey content
create policy "public read thematic_buckets" on thematic_buckets
  for select to anon using (true);

create policy "public read questions" on questions
  for select to anon using (true);

create policy "public read options" on options
  for select to anon using (true);

-- Anon can insert their own session (identified by client-supplied UUID)
create policy "anon insert session" on sessions
  for insert to anon with check (true);

-- Anon can read their own session (optional, for guard-against-double-submit)
create policy "anon read own session" on sessions
  for select to anon using (true);

-- Anon can insert answers
create policy "anon insert answers" on answers
  for insert to anon with check (true);
