"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useOwnerMode } from "@/lib/ownerMode";

const PLUSHIE_TYPES = ["Boost", "Ailments", "Ability Grant", "Mutation Chance"];

export default function PlushiesTab() {
  const { isOwner, passcode } = useOwnerMode();
  const supabase = createClient();
  const [plushies, setPlushies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function loadPlushies() {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase.from("plushies").select("*").order("name");
    if (fetchError) {
      setError(fetchError.message);
      setPlushies([]);
    } else {
      setPlushies(data || []);
    }
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
        {isOwner && (
          <button className="btn-gold" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Cancel" : "+ Add Plushie"}
          </button>
        )}
      </div>

      {isOwner && showAddForm && (
        <PlushieForm
          passcode={passcode}
          onDone={() => { setShowAddForm(false); loadPlushies(); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {loading ? (
        <div className="notes-text">Loading plushies…</div>
      ) : error ? (
        <div className="mod-form" style={{ borderColor: "var(--trait-red)" }}>
          <div className="mod-form-label" style={{ color: "var(--trait-red)" }}>Couldn't load plushies</div>
          <div className="error-text">{error}</div>
        </div>
      ) : plushies.length === 0 ? (
        <div className="notes-text">
          No plushies found in the database yet. Run <code>npm run seed:plushies</code> against this Supabase
          project if you haven't already.
        </div>
      ) : filtered.length === 0 ? (
        <div className="notes-text">No plushies match that search.</div>
      ) : (
        <div className="grid-cards">
          {filtered.map((p) =>
            isOwner && editingId === p.id ? (
              <div key={p.id} style={{ gridColumn: "1 / -1" }}>
                <PlushieForm
                  plushie={p}
                  passcode={passcode}
                  onDone={() => { setEditingId(null); loadPlushies(); }}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div key={p.id} className="info-card">
                <div className="info-card-top">
                  <h3 className="info-name">{p.name}</h3>
                  <span className="tag-pill">{p.type}</span>
                </div>
                <p className="notes-text" style={{ marginTop: 0 }}>{p.effect}</p>
                <div className="section-label" style={{ margin: "8px 0 2px" }}>Availability</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-dim)" }}>{p.availability}</div>
                {isOwner && (
                  <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => setEditingId(p.id)}>Edit</button>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// Used for both adding a new plushie and editing an existing one.
function PlushieForm({ plushie, passcode, onDone, onCancel }) {
  const [name, setName] = useState(plushie ? plushie.name : "");
  const [type, setType] = useState(plushie ? plushie.type : PLUSHIE_TYPES[0]);
  const [effect, setEffect] = useState(plushie ? plushie.effect : "");
  const [availability, setAvailability] = useState(plushie ? plushie.availability : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    if (!name.trim() || !effect.trim() || !availability.trim()) {
      setError("Name, effect, and availability are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/plushies", {
      method: plushie ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passcode,
        id: plushie ? plushie.id : undefined,
        name: name.trim(),
        type,
        effect: effect.trim(),
        availability: availability.trim(),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Save failed.");
    } else {
      onDone();
    }
  }

  return (
    <div className="mod-form">
      <div className="mod-form-label">{plushie ? `Edit ${plushie.name}` : "Add a New Plushie"}</div>
      <div className="mod-form-grid">
        <input placeholder="Plushie name" value={name} onChange={(e) => setName(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {PLUSHIE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="field-full" placeholder="Effect (e.g. +5% damage. Stackable.)" value={effect} onChange={(e) => setEffect(e.target.value)} />
        <input className="field-full" placeholder="Availability (e.g. Halloween Event)" value={availability} onChange={(e) => setAvailability(e.target.value)} />
      </div>
      {error && <div className="error-text">{error}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="btn-gold" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
