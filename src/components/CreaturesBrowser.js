"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AddCreatureForm from "./AddCreatureForm";
import BuildEditor from "./BuildEditor";
import CommentSection from "./CommentSection";

const CATEGORIES = ["All", "Land", "Sea", "Sky"];
const TIERS = ["All", "1", "2", "3", "4", "5"];

export default function CreaturesBrowser() {
  const { isModerator, supabase } = useAuth();
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tier, setTier] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState(false);

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
        {isModerator && (
          <button className="btn-gold" style={{ width: "100%", marginBottom: 12 }} onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Cancel" : "+ Add Creature"}
          </button>
        )}
        <div className="creature-list">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`creature-item ${c.id === selectedId ? "active" : ""}`}
              onClick={() => { setSelectedId(c.id); setEditing(false); }}
            >
              <div className="creature-item-name">{c.name}</div>
              <div className="creature-item-flavor">{c.flavor}</div>
            </div>
          ))}
          {filtered.length === 0 && <div className="notes-text">No creatures match that filter.</div>}
        </div>
      </div>

      <div>
        {showAddForm && isModerator && (
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
              {isModerator && (
                <button className="btn-ghost" onClick={() => setEditing((v) => !v)}>{editing ? "Close Editor" : "Edit"}</button>
              )}
            </div>
            <div className="glow-card-body">
              <div className="stat-grid">
                <StatRow label="Health" value={selected.health} statKey="health" glow={CATEGORY_GLOW[selected.category] || "var(--cyan)"} />
                <StatRow label="Damage" value={selected.damage} statKey="damage" glow={CATEGORY_GLOW[selected.category] || "var(--cyan)"} />
                <StatRow label="Weight" value={selected.weight} statKey="weight" glow={CATEGORY_GLOW[selected.category] || "var(--cyan)"} />
                <StatRow label="Stamina" value={selected.stamina} statKey="stamina" glow={CATEGORY_GLOW[selected.category] || "var(--cyan)"} />
              </div>
              <p className="notes-text" style={{ marginTop: 0 }}>{selected.speed_text}</p>

              <div className="section-label">Best Traits</div>
              <div className="build-list">
                {(selected.best_traits || []).length > 0
                  ? selected.best_traits.map((t) => (
                      <div key={t} className="build-slot">
                        <span className="build-slot-dot" style={{ background: TRAIT_COLOR[TRAIT_CATEGORY[t]] || "var(--ink-dim)" }} />
                        {t}
                      </div>
                    ))
                  : <div className="notes-text">None listed</div>}
              </div>

              <div className="section-label">Recommended Plushies</div>
              <div className="build-list">
                {(selected.recommended_plushies || []).length > 0
                  ? selected.recommended_plushies.map((p) => (
                      <div key={p} className="build-slot">
                        <span className="build-slot-dot" style={{ background: "var(--gold)" }} />
                        {p}
                      </div>
                    ))
                  : <div className="notes-text">None listed</div>}
              </div>

              {selected.notes && <p className="notes-text">{selected.notes}</p>}

              {editing && (
                <BuildEditor creature={selected} onSaved={() => { setEditing(false); loadCreatures(); }} />
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

const STAT_MAX = { health: 17500, damage: 680, weight: 50000, stamina: 230 };
const CATEGORY_GLOW = { Land: "var(--orange)", Sea: "var(--cyan)", Sky: "var(--purple)" };
const TRAIT_CATEGORY = { Bite: "Combat", Damage: "Combat", Weight: "Combat", Health: "Recovery", "Stamina Regen": "Recovery", Healing: "Recovery", Speed: "Mobility", "Max Stamina": "Mobility" };
const TRAIT_COLOR = { Combat: "var(--trait-red)", Recovery: "var(--trait-green)", Mobility: "var(--trait-blue)" };

function StatRow({ label, value, statKey, glow }) {
  const ticks = 20;
  const filled = Math.max(1, Math.round((value / STAT_MAX[statKey]) * ticks));
  return (
    <div className="stat-row">
      <div className="stat-label">{label}</div>
      <div className="stat-ticks">
        {Array.from({ length: ticks }).map((_, i) => (
          <span
            key={i}
            className="tick"
            style={i < filled ? { background: glow, boxShadow: `0 0 6px ${glow}` } : undefined}
          />
        ))}
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
