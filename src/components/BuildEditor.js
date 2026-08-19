"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

// Only rendered for moderators/admins (check this in the parent page too,
// the database's row-level security policy is the real enforcement, this
// is just for a clean UI). Edits the creature row directly now, since
// creatures live fully in the database rather than a separate overrides table.
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
    <div style={{ border: "1px solid #333", borderRadius: 8, padding: 12, marginTop: 12 }}>
      <div style={{ fontSize: 11, color: "#F2C94C", marginBottom: 8 }}>MODERATOR EDIT</div>
      <label>
        Best traits (comma separated)
        <input value={bestTraits} onChange={(e) => setBestTraits(e.target.value)} style={{ width: "100%" }} />
      </label>
      <label>
        Recommended plushies (comma separated)
        <input value={recommendedPlushies} onChange={(e) => setRecommendedPlushies(e.target.value)} style={{ width: "100%" }} />
      </label>
      <label>
        Elder type
        <select value={elder} onChange={(e) => setElder(e.target.value)} style={{ width: "100%" }}>
          <option value="Powerful">Powerful</option>
          <option value="Gentle">Gentle</option>
          <option value="Devious">Devious</option>
        </select>
      </label>
      <label>
        Notes
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: "100%" }} rows={3} />
      </label>
      {error && <div style={{ color: "#ff4545", fontSize: 12 }}>{error}</div>}
      <button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
    </div>
  );
}
