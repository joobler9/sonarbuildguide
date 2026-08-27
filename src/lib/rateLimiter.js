const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 10;

// Checks how many failed passcode attempts have come from this IP recently.
// Returns true if this IP is currently blocked from trying again.
export async function isRateLimited(supabase, ip) {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("passcode_attempts")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("attempted_at", windowStart);

  return (count || 0) >= MAX_ATTEMPTS;
}

// Records a single failed passcode attempt from this IP.
export async function recordFailedAttempt(supabase, ip) {
  await supabase.from("passcode_attempts").insert({ ip });
}

// Vercel puts the real visitor IP in this header.
export function getClientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
