import { createClient } from '@supabase/supabase-js';

// Browser-side client — uses PUBLIC_ env vars exposed by Astro at build time.
// The anon key is a publishable key; it is safe to use in the browser.
// Untyped for the same reason as the server client: hand-crafted interfaces don't
// satisfy Supabase v2's GenericTable index-signature constraint.
export const supabaseBrowser = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL as string,
  import.meta.env.PUBLIC_SUPABASE_KEY as string,
);
