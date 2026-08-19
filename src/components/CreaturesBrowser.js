"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AddCreatureForm from "./AddCreatureForm";
import BuildEditor from "./BuildEditor";
import CommentSection from "./CommentSection";

export default function CreaturesBrowser() {
  const { isModerator, supabase } = useAuth();
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState(false);

  async function loadCreatures() {
    setLoading(true);
    const { data } = await supabase.from("creatures").select("*").order("name");
    setCreatures(data || []);
    if (!selectedId && data && data.length > 0) setSelectedId(data[0].id);
    setLoading(false);
  }

  useEffect(() => {
    loadCreatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = creatures.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const selected = creatures.find((c) => c.id === selectedId);

  if (loading) return <div className="notes-text">Loading creatures…</div>;

  return (
    <div className="builds-layout">
      <div>
        <div className="sidebar-search">
          <input placeholder="Search a creature…" value={query} onChange={(e) => setQuery(e.target.value)} />
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
        </div>
      </div>

      <div>
        {showAddForm && isModerator && (
          <AddCreatureForm onAdded={() => { setShowAddForm(false); loadCreatures(); }} onCancel={() => setShowAddForm(false)} />
        )}

        {selected ? (
          <div className="glow-card">
            <div className="glow-card-header">
              <div>
                <h2 className="creature-name">{selected.name}</h2>
                <p className="creature-flavor">{selected.flavor}</p>
              </div>
              {isModerator && (
                <button className="btn-ghost" onClick={() => setEditing((v) => !v)}>{editing ? "Close Editor" : "Edit"}</button>
              )}
            </div>
            <div className="glow-card-body">
              <div className="stat-grid">
                <Stat label="Health" value={selected.health} />
                <Stat label="Damage" value={selected.damage} />
                <Stat label="Weight" value={selected.weight} />
                <Stat label="Stamina" value={selected.stamina} />
              </div>
              <p className="notes-text" style={{ marginTop: 0 }}>{selected.speed_text}</p>

              <div className="section-label">Best Traits</div>
              <div className="tag-list">
                {(selected.best_traits || []).length > 0
                  ? selected.best_traits.map((t) => <span key={t} className="tag-pill">{t}</span>)
                  : <span className="notes-text">None listed</span>}
              </div>

              <div className="section-label">Recommended Plushies</div>
              <div className="tag-list">
                {(selected.recommended_plushies || []).length > 0
                  ? selected.recommended_plushies.map((p) => <span key={p} className="tag-pill">{p}</span>)
                  : <span className="notes-text">None listed</span>}
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

function Stat({ label, value }) {
  return (
    <div className="stat-box">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
