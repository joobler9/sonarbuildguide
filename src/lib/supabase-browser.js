import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        // Every request explicitly refuses any caching, at the browser
        // HTTP level and any CDN/edge layer in between, so stale data
        // can never be served no matter what's causing it.
        fetch: (url, options = {}) =>
          fetch(url, {
            ...options,
            cache: "no-store",
            headers: {
              ...(options.headers || {}),
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
            },
          }),
      },
    }
  );
}
