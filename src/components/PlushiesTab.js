"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useOwnerMode } from "@/lib/ownerMode";
import { groupPlushies } from "@/lib/groupPlushies";

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
  const [collapsed, setCollapsed] = useState({});

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

  // Sections come from the FULL list, so a search never moves a plushie
  // between sections. The search then just hides non-matches.
  const sections = useMemo(() => groupPlushies(plushies), [plushies]);
  const availabilityOptions = useMemo(
    () => Array.from(new Set(plushies.map((p) => p.availability))).sort(),
    [plushies]
  );

  const q = query.trim().toLowerCase();
  const visibleSections = sections
    .map((s) => ({
      ...s,
      items: q ? s.items.filter((p) => p.name.toLowerCase().includes(q)) : s.items,
    }))
    .filter((s) => s.items.length > 0);
  const matchCount = visibleSections.reduce((n, s) => n + s.items.length, 0);

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
          availabilityOptions={availabilityOptions}
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
      ) : matchCount === 0 ? (
        <div className="notes-text">No plushies match that search.</div>
      ) : (
        visibleSections.map((section) => {
          // While searching, every section with a match stays open.
          const isCollapsed = !q && collapsed[section.name];
          return (
            <div key={section.name} className="plushie-section">
              <button
                className="plushie-section-head"
                onClick={() => setCollapsed((c) => ({ ...c, [section.name]: !c[section.name] }))}
                aria-expanded={!isCollapsed}
              >
                <span className="chev">{isCollapsed ? "▸" : "▾"}</span>
                <span>{section.name}</span>
                <span className="count">{section.items.length}</span>
              </button>

              {!isCollapsed && (
                <div className="plushie-grid">
                  {section.items.map((p) =>
                    isOwner && editingId === p.id ? (
                      <div key={p.id} style={{ gridColumn: "1 / -1" }}>
                        <PlushieForm
                          plushie={p}
                          passcode={passcode}
                          availabilityOptions={availabilityOptions}
                          onDone={() => { setEditingId(null); loadPlushies(); }}
                          onCancel={() => setEditingId(null)}
                        />
                      </div>
                    ) : (
                      <div key={p.id} className="plushie-card">
                        <div className="plushie-card-top">
                          <h3 className="plushie-name">{p.name}</h3>
                          <span className="plushie-type">{p.type}</span>
                        </div>
                        <p className="plushie-effect">{p.effect}</p>
                        {p._detail && <div className="plushie-detail">{p._detail}</div>}
                        {isOwner && (
                          <button className="btn-ghost plushie-edit" onClick={() => setEditingId(p.id)}>Edit</button>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// Used for both adding a new plushie and editing an existing one.
function PlushieForm({ plushie, passcode, availabilityOptions = [], onDone, onCancel }) {
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
        <input
          className="field-full"
          list="plushie-availability-options"
          placeholder="Where it comes from (pick one that exists, or type a new one)"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
        <datalist id="plushie-availability-options">
          {availabilityOptions.map((a) => <option key={a} value={a} />)}
        </datalist>
      </div>
      {error && <div className="error-text">{error}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="btn-gold" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
