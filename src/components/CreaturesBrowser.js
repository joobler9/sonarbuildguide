"use client";


import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useOwnerMode } from "@/lib/ownerMode";
import { useTraits } from "@/lib/useTraits";
import { TRAIT_ICON } from "@/lib/traitsData";
import AddCreatureForm from "./AddCreatureForm";
import BuildEditor from "./BuildEditor";
import CommentSection from "./CommentSection";

const CATEGORIES = ["All", "Land", "Sea", "Sky"];
const TIERS = ["All", "1", "2", "3", "4", "5"];

export default function CreaturesBrowser() {
  const { isOwner } = useOwnerMode();
  const { traits } = useTraits();
  const traitCategory = Object.fromEntries(traits.map((t) => [t.name, t.category]));
  const supabase = createClient();
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tier, setTier] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function loadCreatures() {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase.from("creatures").select("*").order("name");
    if (fetchError) {
      setError(fetchError.message);
      setCreatures([]);
    } else {
      setCreatures(data || []);
      if (!selectedId && data && data.length > 0) setSelectedId(data[0].id);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCreatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = creatures
    .filter((c) => (category === "All" ? true : c.category === category))
    .filter((c) => (tier === "All" ? true : c.tier === tier))
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const selected = creatures.find((c) => c.id === selectedId);

  if (loading) return <div className="notes-text">Loading creatures…</div>;

  if (error) {
    return (
      <div className="mod-form" style={{ borderColor: "var(--trait-red)" }}>
        <div className="mod-form-label" style={{ color: "var(--trait-red)" }}>Couldn't load creatures</div>
        <div className="error-text">{error}</div>
        <div className="notes-text">
          This usually means either the database isn't reachable (check your Vercel environment variables match
          your Supabase project), or the creatures table hasn't been seeded yet.
        </div>
      </div>
    );
  }

  if (creatures.length === 0) {
    return (
      <div className="notes-text">
        No creatures found in the database yet. Run <code>npm run seed:creatures</code> against this Supabase
        project if you haven't already.
      </div>
    );
  }

  return (
    <div className="builds-layout">
      <div>
        <div className="sidebar-search">
          <input placeholder="Search a creature…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="filter-chip-row">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`filter-chip ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="filter-chip-row" style={{ marginBottom: 12 }}>
          {TIERS.map((t) => (
            <button
              key={t}
              className={`filter-chip ${tier === t ? "active" : ""}`}
              onClick={() => setTier(t)}
            >
              {t === "All" ? "All Tiers" : `Tier ${t}`}
            </button>
          ))}
        </div>
        {isOwner && (
          <button className="btn-gold" style={{ width: "100%", marginBottom: 12 }} onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Cancel" : "+ Add Creature"}
          </button>
        )}
        <div className="creature-list">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`creature-item ${c.id === selectedId ? "active" : ""}`}
              onClick={() => { setSelectedId(c.id); setEditing(false); setMobileOpen(true); }}
            >
              <div className="creature-item-name">{c.name}</div>
              <div className="creature-item-flavor">{c.flavor}</div>
            </div>
          ))}
          {filtered.length === 0 && <div className="notes-text">No creatures match that filter.</div>}
        </div>
      </div>

      <div className={`build-detail ${mobileOpen || (showAddForm && isOwner) ? "mobile-open" : ""}`}>
        <button
          className="build-close"
          onClick={() => { setMobileOpen(false); setShowAddForm(false); setEditing(false); }}
          aria-label="Close"
        >
          ✕ Close
        </button>
        {showAddForm && isOwner && (
          <AddCreatureForm onAdded={() => { setShowAddForm(false); loadCreatures(); }} onCancel={() => setShowAddForm(false)} />
        )}

        {selected ? (
          <div className="glow-card">
            <div className="glow-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className={`badge-orb badge-${selected.category?.toLowerCase()}`}>
                  {selected.category === "Land" ? "🌍" : selected.category === "Sea" ? "🌊" : "☁️"}
                </div>
                <div>
                  <h2 className="creature-name">{selected.name}</h2>
                  <p className="creature-flavor">{selected.flavor}</p>
                  <span className="tag-pill" style={{ marginTop: 6, display: "inline-block" }}>{selected.elder} Elder</span>
                </div>
              </div>
              {isOwner && (
                <button className="btn-ghost" onClick={() => setEditing((v) => !v)}>{editing ? "Close Editor" : "Edit"}</button>
              )}
            </div>
            <div className="glow-card-body">
              <div className="section-label">Best Traits</div>
              <div className="build-list">
                {(selected.best_traits || []).length > 0
                  ? selected.best_traits.map((t, i) => (
                      <div key={`${selected.id}-trait-${i}-${t}`} className="build-slot">
                        {TRAIT_ICON[traitCategory[t]] && <img src={TRAIT_ICON[traitCategory[t]]} alt="" className="trait-icon" />}
                        {t}
                      </div>
                    ))
                  : <div className="notes-text">None listed</div>}
              </div>

              <div className="section-label">Recommended Plushies</div>
              <div className="build-list">
                {(selected.recommended_plushies || []).length > 0
                  ? selected.recommended_plushies.map((p, i) => (
                      <div key={`${selected.id}-plushie-${i}-${p}`} className="build-slot">
                        <span className="build-slot-dot" style={{ background: "var(--gold)" }} />
                        {p}
                      </div>
                    ))
                  : <div className="notes-text">None listed</div>}
              </div>

              {editing && (
                <BuildEditor key={selected.id} creature={selected} onSaved={() => { setEditing(false); loadCreatures(); }} />
              )}

              <div className="section-label">Comments</div>
              <CommentSection creatureId={selected.id} />
            </div>
          </div>
        ) : (
          <div className="notes-text">No creature selected.</div>
        )}
      </div>
    </div>
  );
}
