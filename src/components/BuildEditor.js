"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

const TRAIT_NAMES = ["Bite", "Damage", "Weight", "Health", "Stamina Regen", "Healing", "Speed", "Max Stamina"];
const ELDER_TYPES = ["Powerful", "Gentle", "Devious"];

export default function BuildEditor({ creature, onSaved }) {
  const { isModerator, supabase } = useAuth();
  const [bestTraits, setBestTraits] = useState(creature.best_traits || []);
  const [plushiesList, setPlushiesList] = useState([]);
  const [selectedPlushies, setSelectedPlushies] = useState(creature.recommended_plushies || []);
  const [elder, setElder] = useState(creature.elder || "");
  const [notes, setNotes] = useState(creature.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [plushieSearch, setPlushieSearch] = useState("");

  useEffect(() => {
    supabase.from("plushies").select("name").order("name").then(({ data }) => {
      setPlushiesList((data || []).map((p) => p.name));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isModerator) return null;

  function toggleTrait(name) {
    setBestTraits((prev) => (prev.includes(name) ? prev.filter((t) => t !== name) : prev.length >= 2 ? prev : [...prev, name]));
  }

  function togglePlushie(name) {
    setSelectedPlushies((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : prev.length >= 2 ? prev : [...prev, name]));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const { error: saveError } = await supabase
      .from("creatures")
      .update({
        best_traits: bestTraits,
        recommended_plushies: selectedPlushies,
        elder,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", creature.id);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
    } else if (onSaved) {
      onSaved();
    }
  }

  const filteredPlushies = plushiesList.filter((p) => p.toLowerCase().includes(plushieSearch.toLowerCase()));

  return (
    <div className="mod-form">
      <div className="mod-form-label">Moderator Edit</div>

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

      <div className="picker-section-label">Elder Type</div>
      <select value={elder} onChange={(e) => setElder(e.target.value)} style={{ width: "100%", marginBottom: 10 }}>
        {ELDER_TYPES.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
      </select>

      <div className="picker-section-label">Notes</div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: "100%" }} />

      {error && <div className="error-text">{error}</div>}
      <button className="btn-gold" style={{ marginTop: 10 }} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
    </div>
  );
}
