import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
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
