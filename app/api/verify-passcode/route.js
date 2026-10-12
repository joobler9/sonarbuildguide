import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isRateLimited, recordFailedAttempt, getClientIp } from "@/lib/rateLimiter";

// Lets the unlock box check a passcode with the server BEFORE the browser
// treats you as the owner, so a wrong passcode is rejected immediately.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  if (!process.env.OWNER_PASSCODE) {
    return NextResponse.json(
      { error: "No OWNER_PASSCODE is set on the server. Add it in Vercel and redeploy." },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();
  const ip = getClientIp(request);

  if (await isRateLimited(supabase, ip)) {
    return NextResponse.json({ error: "Too many failed attempts. Try again in a few minutes." }, { status: 429 });
  }
  if (!body.passcode || body.passcode !== process.env.OWNER_PASSCODE) {
    await recordFailedAttempt(supabase, ip);
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
