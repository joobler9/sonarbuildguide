"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import AddCreatureForm from "./AddCreatureForm";
import BuildEditor from "./BuildEditor";

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

  if (loading) return <div>Loading creatures…</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 18 }}>
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
        </div>
        {isModerator && (
          <button onClick={() => setShowAddForm((v) => !v)} style={{ width: "100%", marginBottom: 10 }}>
            {showAddForm ? "Cancel" : "+ Add Creature"}
          </button>
        )}
        <div style={{ maxHeight: 600, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => { setSelectedId(c.id); setEditing(false); }}
              style={{
                padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                background: c.id === selectedId ? "#222" : "transparent",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{c.flavor}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        {showAddForm && isModerator && (
          <AddCreatureForm onAdded={() => { setShowAddForm(false); loadCreatures(); }} onCancel={() => setShowAddForm(false)} />
        )}

        {selected ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ margin: 0 }}>{selected.name}</h2>
                <p style={{ color: "#888", margin: "4px 0" }}>{selected.flavor}</p>
              </div>
              {isModerator && (
                <button onClick={() => setEditing((v) => !v)}>{editing ? "Close Editor" : "Edit"}</button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, margin: "16px 0" }}>
              <Stat label="Health" value={selected.health} />
              <Stat label="Damage" value={selected.damage} />
              <Stat label="Weight" value={selected.weight} />
              <Stat label="Stamina" value={selected.stamina} />
            </div>
            <p style={{ fontSize: 12, color: "#888" }}>{selected.speed_text}</p>

            <div style={{ marginTop: 12 }}>
              <strong>Best Traits:</strong> {(selected.best_traits || []).join(", ") || "—"}
            </div>
            <div style={{ marginTop: 6 }}>
              <strong>Recommended Plushies:</strong> {(selected.recommended_plushies || []).join(", ") || "—"}
            </div>
            {selected.notes && <p style={{ marginTop: 12, color: "#aaa" }}>{selected.notes}</p>}

            {editing && (
              <BuildEditor
                creature={selected}
                onSaved={() => { setEditing(false); loadCreatures(); }}
              />
            )}
          </div>
        ) : (
          <div>No creature selected.</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ border: "1px solid #333", borderRadius: 8, padding: 8, textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
