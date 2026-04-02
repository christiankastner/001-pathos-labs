
-- Add the questions table to the supabase_realtime publication so that
-- changes to the active question are broadcast to connected clients.
alter publication supabase_realtime add table questions;
