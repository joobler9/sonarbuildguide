"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

const CATEGORIES = ["Land", "Sea", "Sky"];
const ELDER_TYPES = ["Powerful", "Gentle", "Devious"];
const TIERS = ["1", "2", "3", "4", "5"];

const BLANK_FORM = {
  name: "",
  flavor: "",
  category: "Land",
  diet: "",
  playstyle: "",
  elder: "Powerful",
  tier: "3",
  health: "",
  damage: "",
  weight: "",
  stamina: "",
  speedText: "",
  bestTraits: "",
  recommendedPlushies: "",
  notes: "",
};

// Only ever rendered when isModerator is true (checked by the parent), but
// the real enforcement is the database's row-level security policy — even
// a moderator-only UI button doesn't matter if the database would reject
// the insert from a non-moderator account.
export default function AddCreatureForm({ onAdded, onCancel }) {
  const { isModerator, supabase } = useAuth();
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isModerator) return null;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    if (!form.name.trim() || !form.flavor.trim() || !form.diet.trim() || !form.playstyle.trim()) {
      setError("Name, flavor, diet, and playstyle are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from("creatures").insert({
      name: form.name.trim(),
      flavor: form.flavor.trim(),
      category: form.category,
      diet: form.diet.trim(),
      playstyle: form.playstyle.trim(),
      elder: form.elder,
      tier: form.tier,
      health: Number(form.health) || 0,
      damage: Number(form.damage) || 0,
      weight: Number(form.weight) || 0,
      stamina: Number(form.stamina) || 0,
      speed_text: form.speedText.trim(),
      best_traits: form.bestTraits.split(",").map((t) => t.trim()).filter(Boolean),
      recommended_plushies: form.recommendedPlushies.split(",").map((p) => p.trim()).filter(Boolean),
      notes: form.notes.trim(),
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      setForm(BLANK_FORM);
      if (onAdded) onAdded();
    }
  }

  return (
    <div style={{ border: "1px solid #F2C94C", borderRadius: 10, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: "#F2C94C", marginBottom: 10 }}>ADD A NEW CREATURE</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <input placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input placeholder="Flavor text (e.g. Tier 5 · Huge land predator)" value={form.flavor} onChange={(e) => set("flavor", e.target.value)} />

        <select value={form.category} onChange={(e) => set("category", e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Diet (e.g. Carnivore)" value={form.diet} onChange={(e) => set("diet", e.target.value)} />

        <input placeholder="Playstyle (e.g. Tank, Ankle Biter, Evasion)" value={form.playstyle} onChange={(e) => set("playstyle", e.target.value)} />
        <select value={form.elder} onChange={(e) => set("elder", e.target.value)}>
          {ELDER_TYPES.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
        </select>

        <select value={form.tier} onChange={(e) => set("tier", e.target.value)}>
          {TIERS.map((t) => <option key={t} value={t}>Tier {t}</option>)}
        </select>
        <input placeholder="Speed text (e.g. Walk 30 · Sprint 50)" value={form.speedText} onChange={(e) => set("speedText", e.target.value)} />

        <input type="number" placeholder="Health" value={form.health} onChange={(e) => set("health", e.target.value)} />
        <input type="number" placeholder="Damage" value={form.damage} onChange={(e) => set("damage", e.target.value)} />
        <input type="number" placeholder="Weight" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
        <input type="number" placeholder="Stamina" value={form.stamina} onChange={(e) => set("stamina", e.target.value)} />

        <input placeholder="Best traits (comma separated)" value={form.bestTraits} onChange={(e) => set("bestTraits", e.target.value)} style={{ gridColumn: "1 / -1" }} />
        <input placeholder="Recommended plushies (comma separated)" value={form.recommendedPlushies} onChange={(e) => set("recommendedPlushies", e.target.value)} style={{ gridColumn: "1 / -1" }} />
        <textarea placeholder="Notes / build reasoning" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} style={{ gridColumn: "1 / -1" }} />
      </div>
      {error && <div style={{ color: "#ff4545", fontSize: 12, marginTop: 8 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={submit} disabled={saving}>{saving ? "Adding…" : "Add Creature"}</button>
        {onCancel && <button onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
