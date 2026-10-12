import { isRateLimited, recordFailedAttempt, getClientIp } from "@/lib/rateLimiter";

// Shared passcode check for the owner-only routes. Runs on the server only.
export async function checkOwner(request, body, supabase) {
  if (!process.env.OWNER_PASSCODE) {
    return { ok: false, status: 500, error: "No OWNER_PASSCODE is set on the server. Add it in Vercel and redeploy." };
  }
  const ip = getClientIp(request);
  if (await isRateLimited(supabase, ip)) {
    return { ok: false, status: 429, error: "Too many failed attempts. Try again in a few minutes." };
  }
  if (!body.passcode || body.passcode !== process.env.OWNER_PASSCODE) {
    await recordFailedAttempt(supabase, ip);
    return { ok: false, status: 401, error: "Incorrect passcode." };
  }
  return { ok: true };
}
