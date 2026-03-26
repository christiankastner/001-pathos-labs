-- Allow anon to update their own answers (required for upsert on conflict).
-- Session IDs are client-generated UUIDs stored in localStorage — there is no
-- server-side user identity, so we permit update on any row the anon key can see.

create policy "anon update answers" on answers
  for update to anon using (true) with check (true);
