import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isRateLimited, recordFailedAttempt, getClientIp } from "@/lib/rateLimiter";

export async function POST(request) {
  const body = await request.json();
  const supabase = createAdminClient();
  const ip = getClientIp(request);

  if (await isRateLimited(supabase, ip)) {
    return NextResponse.json({ error: "Too many failed attempts. Try again in a few minutes." }, { status: 429 });
  }
  if (!body.passcode || body.passcode !== process.env.OWNER_PASSCODE) {
    await recordFailedAttempt(supabase, ip);
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }

  const { error } = await supabase.from("comments").delete().eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
