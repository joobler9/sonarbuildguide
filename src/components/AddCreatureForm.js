"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

const CATEGORIES = ["Land", "Sea", "Sky"];
const ELDER_TYPES = ["Powerful", "Gentle", "Devious"];
const TIERS = ["1", "2", "3", "4", "5"];
const TRAIT_NAMES = ["Bite", "Damage", "Weight", "Health", "Stamina Regen", "Healing", "Speed", "Max Stamina"];

const BLANK_FORM = {
  name: "", flavor: "", category: "Land", diet: "", playstyle: "", elder: "Powerful", tier: "3",
  health: "", damage: "", weight: "", stamina: "", speedText: "", notes: "",
};

export default function AddCreatureForm({ onAdded, onCancel }) {
  const { isModerator, supabase } = useAuth();
  const [form, setForm] = useState(BLANK_FORM);
  const [bestTraits, setBestTraits] = useState([]);
  const [selectedPlushies, setSelectedPlushies] = useState([]);
  const [plushiesList, setPlushiesList] = useState([]);
  const [plushieSearch, setPlushieSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.from("plushies").select("name").order("name").then(({ data }) => {
      setPlushiesList((data || []).map((p) => p.name));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isModerator) return null;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleTrait(name) {
    setBestTraits((prev) => (prev.includes(name) ? prev.filter((t) => t !== name) : prev.length >= 2 ? prev : [...prev, name]));
  }

  function togglePlushie(name) {
    setSelectedPlushies((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : prev.length >= 2 ? prev : [...prev, name]));
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
      best_traits: bestTraits,
      recommended_plushies: selectedPlushies,
      notes: form.notes.trim(),
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      setForm(BLANK_FORM);
      setBestTraits([]);
      setSelectedPlushies([]);
      if (onAdded) onAdded();
    }
  }

  const filteredPlushies = plushiesList.filter((p) => p.toLowerCase().includes(plushieSearch.toLowerCase()));

  return (
    <div className="mod-form">
      <div className="mod-form-label">Add a New Creature</div>
      <div className="mod-form-grid">
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

        <textarea className="field-full" placeholder="Notes / build reasoning" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </div>

      <div className="picker-section-label">Best Traits ({bestTraits.length}/2)</div>
      <div className="chip-picker">
        {TRAIT_NAMES.map((t) => (
          <button
            key={t}
            type="button"
            className={`chip-toggle ${bestTraits.includes(t) ? "active" : ""}`}
            onClick={() => toggleTrait(t)}
            disabled={!bestTraits.includes(t) && bestTraits.length >= 2}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="picker-section-label">Recommended Plushies ({selectedPlushies.length}/2)</div>
      {selectedPlushies.length > 0 && (
        <div className="chip-picker" style={{ marginBottom: 8 }}>
          {selectedPlushies.map((p) => (
            <button key={p} type="button" className="chip-toggle active" onClick={() => togglePlushie(p)}>
              {p} ✕
            </button>
          ))}
        </div>
      )}
      <input
        placeholder="Search plushies to add…"
        value={plushieSearch}
        onChange={(e) => setPlushieSearch(e.target.value)}
        style={{ marginBottom: 6, width: "100%" }}
      />
      <div className="chip-picker-scroll">
        {filteredPlushies.filter((p) => !selectedPlushies.includes(p)).map((p) => (
          <button
            key={p}
            type="button"
            className="chip-toggle"
            onClick={() => togglePlushie(p)}
            disabled={selectedPlushies.length >= 2}
          >
            {p}
          </button>
        ))}
      </div>

      {error && <div className="error-text">{error}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="btn-gold" onClick={submit} disabled={saving}>{saving ? "Adding…" : "Add Creature"}</button>
        {onCancel && <button className="btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
