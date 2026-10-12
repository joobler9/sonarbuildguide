"use client";

import { useState } from "react";
import { useOwnerMode } from "@/lib/ownerMode";
import { useTraits } from "@/lib/useTraits";
import { TRAIT_ICON, TRAIT_CATEGORIES, CATEGORY_COLOR } from "@/lib/traitsData";

export default function TraitsTab() {
  const { isOwner, passcode } = useOwnerMode();
  const { traits, reload } = useTraits();
  const [editing, setEditing] = useState(null); // a trait's name, or "__new__"

  return (
    <div>
      {isOwner && (
        <div style={{ marginBottom: 16 }}>
          <button className="btn-gold" onClick={() => setEditing(editing === "__new__" ? null : "__new__")}>
            {editing === "__new__" ? "Cancel" : "+ Add Trait"}
          </button>
        </div>
      )}

      {isOwner && editing === "__new__" && (
        <TraitForm
          passcode={passcode}
          onDone={() => { setEditing(null); reload(); }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="grid-cards">
        {traits.map((t) =>
          isOwner && editing === t.name ? (
            <div key={t.name} style={{ gridColumn: "1 / -1" }}>
              <TraitForm
                trait={t}
                passcode={passcode}
                onDone={() => { setEditing(null); reload(); }}
                onCancel={() => setEditing(null)}
              />
            </div>
          ) : (
            <div key={t.name} className="info-card" style={{ borderColor: CATEGORY_COLOR[t.category] }}>
              <div className="info-card-top">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {TRAIT_ICON[t.category] && <img src={TRAIT_ICON[t.category]} alt="" className="trait-icon" />}
                  <h3 className="info-name">{t.name}</h3>
                </div>
                <span className="tag-pill" style={{ borderColor: CATEGORY_COLOR[t.category], color: CATEGORY_COLOR[t.category] }}>
                  {t.category}
                </span>
              </div>
              <p className="notes-text" style={{ marginTop: 0 }}>{t.effect}</p>
              {isOwner && (
                <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => setEditing(t.name)}>Edit</button>
              )}
            </div>
          )
        )}
      </div>
      <div className="footer-note" style={{ marginTop: 20 }}>
        Each creature can gain up to two traits total, one at age 66 and one at age 100. Nested creatures have a 100%
        chance of getting both.
      </div>
    </div>
  );
}

function TraitForm({ trait, passcode, onDone, onCancel }) {
  const [name, setName] = useState(trait ? trait.name : "");
  const [category, setCategory] = useState(trait ? trait.category : TRAIT_CATEGORIES[0]);
  const [effect, setEffect] = useState(trait ? trait.effect : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    if (!name.trim() || !effect.trim()) {
      setError("Name and effect are required.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/traits", {
      method: trait ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passcode,
        originalName: trait ? trait.name : undefined,
        name: name.trim(),
        category,
        effect: effect.trim(),
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
      <div className="mod-form-label">{trait ? `Edit ${trait.name}` : "Add a New Trait"}</div>
      <div className="mod-form-grid">
        <input placeholder="Trait name" value={name} onChange={(e) => setName(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {TRAIT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea
          className="field-full"
          placeholder="Effect (e.g. +5% attack damage.)"
          value={effect}
          onChange={(e) => setEffect(e.target.value)}
          rows={3}
        />
      </div>
      {error && <div className="error-text">{error}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="btn-gold" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
