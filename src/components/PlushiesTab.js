"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";

const PLUSHIE_TYPES = ["Boost", "Ailments", "Ability Grant", "Mutation Chance"];

export default function PlushiesTab() {
  const { isModerator, supabase } = useAuth();
  const [plushies, setPlushies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  async function loadPlushies() {
    setLoading(true);
    const { data } = await supabase.from("plushies").select("*").order("name");
    setPlushies(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadPlushies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = plushies.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <input
          placeholder="Search a plushie…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        {isModerator && (
          <button onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Cancel" : "+ Add Plushie"}
          </button>
        )}
      </div>

      {isModerator && showAddForm && (
        <AddPlushieForm
          supabase={supabase}
          onAdded={() => { setShowAddForm(false); loadPlushies(); }}
        />
      )}

      {loading ? (
        <div>Loading plushies…</div>
      ) : filtered.length === 0 ? (
        <div>No plushies match that search.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ border: "1px solid #333", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{p.name}</strong>
                <span style={{ fontSize: 10, textTransform: "uppercase", color: "#888" }}>{p.type}</span>
              </div>
              <p style={{ fontSize: 13, color: "#aaa", margin: "6px 0" }}>{p.effect}</p>
              <div style={{ fontSize: 11, color: "#888" }}>Availability: {p.availability}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Only ever rendered when isModerator is true (checked by the parent above),
// but the real enforcement is the database's row-level security policy —
// even a moderator-only UI button doesn't matter if the database would
// reject the insert from a non-moderator account.
function AddPlushieForm({ supabase, onAdded }) {
  const [name, setName] = useState("");
  const [type, setType] = useState(PLUSHIE_TYPES[0]);
  const [effect, setEffect] = useState("");
  const [availability, setAvailability] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    if (!name.trim() || !effect.trim() || !availability.trim()) return;
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from("plushies").insert({
      name: name.trim(),
      type,
      effect: effect.trim(),
      availability: availability.trim(),
    });
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      onAdded();
    }
  }

  return (
    <div style={{ border: "1px solid #F2C94C", borderRadius: 10, padding: 14, marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: "#F2C94C", marginBottom: 8 }}>ADD A NEW PLUSHIE</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input placeholder="Plushie name" value={name} onChange={(e) => setName(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {PLUSHIE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input placeholder="Effect (e.g. +5% damage. Stackable.)" value={effect} onChange={(e) => setEffect(e.target.value)} />
        <input placeholder="Availability (e.g. Halloween Event)" value={availability} onChange={(e) => setAvailability(e.target.value)} />
        {error && <div style={{ color: "#ff4545", fontSize: 12 }}>{error}</div>}
        <button onClick={submit} disabled={saving}>{saving ? "Adding…" : "Add Plushie"}</button>
      </div>
    </div>
  );
}
