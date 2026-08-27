import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// A single shared connection, created once and reused everywhere it's
// asked for. Without this, calling createClient() fresh inside a
// component's render creates a brand new object every single render,
// which breaks any useEffect that has it in a dependency list — React
// sees "a new value!" on every render and re-runs the effect forever,
// causing an endless reload loop.
let sharedClient = null;

export function createClient() {
  if (!sharedClient) {
    sharedClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          // Every request explicitly refuses any caching, at the browser
          // HTTP level and any CDN/edge layer in between, so stale data
          // can never be served no matter what's causing it. Uses the real
          // Headers API to merge on top of Supabase's own headers (apikey,
          // Authorization, etc.) instead of spreading them, since spreading
          // a Headers instance with `...` silently drops its contents.
          fetch: (url, options = {}) => {
            const headers = new Headers(options.headers);
            headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.set("Pragma", "no-cache");
            return fetch(url, { ...options, cache: "no-store", headers });
          },
        },
      }
    );
  }
  return sharedClient;
}
