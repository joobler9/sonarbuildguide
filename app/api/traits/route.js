import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkOwner } from "@/lib/ownerAuth";
import { renameInCreatures } from "@/lib/renameInCreatures";

const CATEGORIES = ["Combat", "Recovery", "Mobility"];

function validate(body) {
  const name = (body.name || "").trim();
  const effect = (body.effect || "").trim();
  if (!name || !effect) return { error: "Name and effect are required." };
  if (!CATEGORIES.includes(body.category)) return { error: "Pick a valid category." };
  return { name, effect, category: body.category };
}

function friendlyError(error) {
  if (/traits/i.test(error.message) && /(does not exist|schema cache|could not find)/i.test(error.message)) {
    return "The traits table doesn't exist yet. Run migration-traits.sql in Supabase first.";
  }
  return error.message;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const supabase = createAdminClient();
  const check = await checkOwner(request, body, supabase);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const v = validate(body);
  if (v.error) return NextResponse.json({ error: v.error }, { status: 400 });

  // New traits go at the end of the list.
  const { data: last } = await supabase
    .from("traits").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const nextOrder = ((last && last[0] && last[0].sort_order) || 0) + 1;

  const { error } = await supabase
    .from("traits")
    .insert({ name: v.name, category: v.category, effect: v.effect, sort_order: nextOrder });
  if (error) return NextResponse.json({ error: friendlyError(error) }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request) {
  const body = await request.json().catch(() => ({}));
  const supabase = createAdminClient();
  const check = await checkOwner(request, body, supabase);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const v = validate(body);
  if (v.error) return NextResponse.json({ error: v.error }, { status: 400 });
  const originalName = (body.originalName || "").trim();
  if (!originalName) return NextResponse.json({ error: "Missing the trait to edit." }, { status: 400 });

  if (v.name === originalName) {
    const { error } = await supabase
      .from("traits")
      .upsert({ name: v.name, category: v.category, effect: v.effect }, { onConflict: "name" });
    if (error) return NextResponse.json({ error: friendlyError(error) }, { status: 500 });
  } else {
    const { data, error } = await supabase
      .from("traits")
      .update({ name: v.name, category: v.category, effect: v.effect })
      .eq("name", originalName)
      .select("id");
    if (error) return NextResponse.json({ error: friendlyError(error) }, { status: 500 });
    if (!data || data.length === 0) {
      const { error: insertError } = await supabase
        .from("traits")
        .insert({ name: v.name, category: v.category, effect: v.effect });
      if (insertError) return NextResponse.json({ error: friendlyError(insertError) }, { status: 500 });
    }
    await renameInCreatures(supabase, "best_traits", originalName, v.name);
  }
  return NextResponse.json({ ok: true });
}
