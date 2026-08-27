import { createClient } from "@supabase/supabase-js";

// SERVER-SIDE ONLY. Uses the service role key, which bypasses all RLS
// policies. Never import this from a "use client" component, only from
// API routes (app/api/**/route.js), which run exclusively on the server.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
