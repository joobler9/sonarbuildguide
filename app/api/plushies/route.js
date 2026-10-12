import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { checkOwner } from "@/lib/ownerAuth";
import { renameInCreatures } from "@/lib/renameInCreatures";

const TYPES = ["Boost", "Ailments", "Ability Grant", "Mutation Chance"];

function validate(body) {
  const name = (body.name || "").trim();
  const effect = (body.effect || "").trim();
  const availability = (body.availability || "").trim();
  if (!name || !effect || !availability) return { error: "Name, effect, and availability are required." };
  if (!TYPES.includes(body.type)) return { error: "Pick a valid plushie type." };
  return { name, effect, availability, type: body.type };
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const supabase = createAdminClient();
  const check = await checkOwner(request, body, supabase);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const v = validate(body);
  if (v.error) return NextResponse.json({ error: v.error }, { status: 400 });

  const { error } = await supabase.from("plushies").insert(v);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request) {
  const body = await request.json().catch(() => ({}));
  const supabase = createAdminClient();
  const check = await checkOwner(request, body, supabase);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const v = validate(body);
  if (v.error) return NextResponse.json({ error: v.error }, { status: 400 });
  if (!body.id) return NextResponse.json({ error: "Missing the plushie to edit." }, { status: 400 });

  const { data: existing, error: findError } = await supabase
    .from("plushies").select("name").eq("id", body.id).single();
  if (findError || !existing) return NextResponse.json({ error: "That plushie wasn't found." }, { status: 404 });

  const { error } = await supabase.from("plushies").update(v).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (existing.name !== v.name) {
    await renameInCreatures(supabase, "recommended_plushies", existing.name, v.name);
  }
  return NextResponse.json({ ok: true });
}
