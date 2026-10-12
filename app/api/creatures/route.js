import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isRateLimited, recordFailedAttempt, getClientIp } from "@/lib/rateLimiter";

// Verifies the passcode ON THE SERVER before touching the database at all.
// The real database credentials (service role key) never leave this file,
// so there's no way for someone to bypass this by inspecting the browser.
async function verifyPasscode(request, body, supabase) {
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

export async function POST(request) {
  const body = await request.json();
  const supabase = createAdminClient();

  const check = await verifyPasscode(request, body, supabase);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { error } = await supabase.from("creatures").insert({
    name: body.name,
    flavor: body.flavor,
    category: body.category,
    diet: body.diet,
    playstyle: body.playstyle,
    elder: body.elder,
    tier: body.tier,
    health: body.health ?? 0,
    damage: body.damage ?? 0,
    weight: body.weight ?? 0,
    stamina: body.stamina ?? 0,
    speed_text: body.speedText ?? "",
    best_traits: body.bestTraits,
    recommended_plushies: body.recommendedPlushies,
    notes: body.notes,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request) {
  const body = await request.json();
  const supabase = createAdminClient();

  const check = await verifyPasscode(request, body, supabase);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { error } = await supabase
    .from("creatures")
    .update({
      best_traits: body.bestTraits,
      recommended_plushies: body.recommendedPlushies,
      elder: body.elder,
      notes: body.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
