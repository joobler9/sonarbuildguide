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
        <div className="sidebar-search" style={{ flex: 1, marginBottom: 0 }}>
          <input placeholder="Search a plushie…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {isModerator && (
          <button className="btn-gold" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Cancel" : "+ Add Plushie"}
          </button>
        )}
      </div>

      {isModerator && showAddForm && (
        <AddPlushieForm supabase={supabase} onAdded={() => { setShowAddForm(false); loadPlushies(); }} />
      )}

      {loading ? (
        <div className="notes-text">Loading plushies…</div>
      ) : filtered.length === 0 ? (
        <div className="notes-text">No plushies match that search.</div>
      ) : (
        <div className="grid-cards">
          {filtered.map((p) => (
            <div key={p.id} className="info-card">
              <div className="info-card-top">
                <h3 className="info-name">{p.name}</h3>
                <span className="tag-pill">{p.type}</span>
              </div>
              <p className="notes-text" style={{ marginTop: 0 }}>{p.effect}</p>
              <div className="section-label" style={{ margin: "8px 0 2px" }}>Availability</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-dim)" }}>{p.availability}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
      name: name.trim(), type, effect: effect.trim(), availability: availability.trim(),
    });
    setSaving(false);
    if (insertError) setError(insertError.message);
    else onAdded();
  }

  return (
    <div className="mod-form">
      <div className="mod-form-label">Add a New Plushie</div>
      <div className="mod-form-grid">
        <input placeholder="Plushie name" value={name} onChange={(e) => setName(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {PLUSHIE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="field-full" placeholder="Effect (e.g. +5% damage. Stackable.)" value={effect} onChange={(e) => setEffect(e.target.value)} />
        <input className="field-full" placeholder="Availability (e.g. Halloween Event)" value={availability} onChange={(e) => setAvailability(e.target.value)} />
      </div>
      {error && <div className="error-text">{error}</div>}
      <button className="btn-gold" style={{ marginTop: 10 }} onClick={submit} disabled={saving}>
        {saving ? "Adding…" : "Add Plushie"}
      </button>
    </div>
  );
}
