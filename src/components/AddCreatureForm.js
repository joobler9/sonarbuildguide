"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useOwnerMode } from "@/lib/ownerMode";
import { useTraits } from "@/lib/useTraits";
import TagPicker from "./TagPicker";

const CATEGORIES = ["Land", "Sea", "Sky"];
const ELDER_TYPES = ["Powerful", "Gentle", "Devious"];
const TIERS = ["1", "2", "3", "4", "5"];

const BLANK_FORM = {
  name: "", flavor: "", category: "Land", diet: "", playstyle: "", elder: "Powerful", tier: "3",
  notes: "",
};

export default function AddCreatureForm({ onAdded, onCancel }) {
  const { isOwner, passcode } = useOwnerMode();
  const supabase = createClient();
  const { traits } = useTraits();
  const traitNames = traits.map((t) => t.name);
  const [form, setForm] = useState(BLANK_FORM);
  const [bestTraits, setBestTraits] = useState([]);
  const [selectedPlushies, setSelectedPlushies] = useState([]);
  const [tags, setTags] = useState([]);
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

  if (!isOwner) return null;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleTrait(name) {
    setBestTraits((prev) => (prev.includes(name) ? prev.filter((t) => t !== name) : prev.length >= 2 ? prev : [...prev, name]));
  }

  // Adding always works (up to 2), so the same plushie can be picked twice.
  function addPlushie(name) {
    setSelectedPlushies((prev) => (prev.length >= 2 ? prev : [...prev, name]));
  }

  // Removes just the one at this position, so removing one of two
  // identical plushies leaves the other.
  function removePlushieAt(index) {
    setSelectedPlushies((prev) => prev.filter((_, i) => i !== index));
  }

  async function submit() {
    if (!form.name.trim() || !form.flavor.trim() || !form.diet.trim() || !form.playstyle.trim()) {
      setError("Name, flavor, diet, and playstyle are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/creatures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passcode,
        name: form.name.trim(),
        flavor: form.flavor.trim(),
        category: form.category,
        diet: form.diet.trim(),
        playstyle: form.playstyle.trim(),
        elder: form.elder,
        tier: form.tier,
        bestTraits,
        recommendedPlushies: selectedPlushies,
        notes: form.notes.trim(),
        tags,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to add creature.");
    } else {
      setForm(BLANK_FORM);
      setBestTraits([]);
      setSelectedPlushies([]);
      setTags([]);
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


        <textarea className="field-full" placeholder="Notes / build reasoning" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </div>

      <div className="picker-section-label">Best Traits ({bestTraits.length}/2)</div>
      <div className="chip-picker">
        {traitNames.map((t) => (
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
          {selectedPlushies.map((p, i) => (
            <button key={`${p}-${i}`} type="button" className="chip-toggle active" onClick={() => removePlushieAt(i)}>
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
        {filteredPlushies.map((p) => (
          <button
            key={p}
            type="button"
            className="chip-toggle"
            onClick={() => addPlushie(p)}
            disabled={selectedPlushies.length >= 2}
          >
            {p}
          </button>
        ))}
      </div>

      <TagPicker tags={tags} onChange={setTags} />

      {error && <div className="error-text">{error}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="btn-gold" onClick={submit} disabled={saving}>{saving ? "Adding…" : "Add Creature"}</button>
        {onCancel && <button className="btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
