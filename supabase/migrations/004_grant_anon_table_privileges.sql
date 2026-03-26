-- Explicitly grant table-level privileges to the anon role.
-- Supabase applies these automatically for tables created via the dashboard,
-- but migrations run through the SQL editor may not inherit the default grants.

grant select, insert, update on answers  to anon;
grant select, insert         on sessions to anon;
