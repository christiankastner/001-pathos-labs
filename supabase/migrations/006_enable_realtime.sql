
-- Add the answers table to the supabase_realtime publication so INSERT,
-- UPDATE, and DELETE events are broadcast over the WebSocket connection.
alter publication supabase_realtime add table answers;
