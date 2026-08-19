"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

export default function BuildEditor({ creature, onSaved }) {
  const { isModerator, supabase } = useAuth();
  const [bestTraits, setBestTraits] = useState((creature.best_traits || []).join(", "));
  const [recommendedPlushies, setRecommendedPlushies] = useState((creature.recommended_plushies || []).join(", "));
  const [elder, setElder] = useState(creature.elder || "");
  const [notes, setNotes] = useState(creature.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isModerator) return null;

  async function save() {
    setSaving(true);
    setError(null);
    const { error: saveError } = await supabase
      .from("creatures")
      .update({
        best_traits: bestTraits.split(",").map((t) => t.trim()).filter(Boolean),
        recommended_plushies: recommendedPlushies.split(",").map((p) => p.trim()).filter(Boolean),
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

  return (
    <div className="mod-form">
      <div className="mod-form-label">Moderator Edit</div>
      <div className="mod-form-grid">
        <input className="field-full" placeholder="Best traits (comma separated)" value={bestTraits} onChange={(e) => setBestTraits(e.target.value)} />
        <input className="field-full" placeholder="Recommended plushies (comma separated)" value={recommendedPlushies} onChange={(e) => setRecommendedPlushies(e.target.value)} />
        <select value={elder} onChange={(e) => setElder(e.target.value)}>
          <option value="Powerful">Powerful</option>
          <option value="Gentle">Gentle</option>
          <option value="Devious">Devious</option>
        </select>
        <textarea className="field-full" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </div>
      {error && <div className="error-text">{error}</div>}
      <button className="btn-gold" style={{ marginTop: 10 }} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
    </div>
  );
}
