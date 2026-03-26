-- Allow anon role to read answers and sessions.
-- All data is anonymous (sessions are random UUIDs, no PII); this is intentional.
-- Restrict or replace with service-role access if auth is added later.

create policy "anon read answers" on answers
  for select to anon using (true);

create policy "anon read sessions" on sessions
  for select to anon using (true);
