"use client";

import { useState } from "react";
import { PRESET_TAGS, MAX_TAGS, cleanTags, tagClass } from "@/lib/tags";

// Pick tags for a build: quick buttons for the usual ones, or type your own.
export default function TagPicker({ tags, onChange }) {
  const [custom, setCustom] = useState("");
  const full = tags.length >= MAX_TAGS;

  function add(tag) {
    onChange(cleanTags([...tags, tag]));
  }

  function addCustom() {
    if (!custom.trim()) return;
    add(custom);
    setCustom("");
  }

  return (
    <div>
      <div className="picker-section-label">Tags ({tags.length}/{MAX_TAGS})</div>
      {tags.length > 0 && (
        <div className="chip-picker" style={{ marginBottom: 8 }}>
          {tags.map((t, i) => (
            <button
              key={`${t}-${i}`}
              type="button"
              className={`build-tag ${tagClass(t)}`}
              onClick={() => onChange(tags.filter((_, idx) => idx !== i))}
            >
              {t} ✕
            </button>
          ))}
        </div>
      )}
      <div className="chip-picker" style={{ marginBottom: 8 }}>
        {PRESET_TAGS.filter((t) => !tags.includes(t)).map((t) => (
          <button key={t} type="button" className="chip-toggle" onClick={() => add(t)} disabled={full}>
            + {t}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Or type your own tag…"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          maxLength={20}
          disabled={full}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn-ghost" onClick={addCustom} disabled={full || !custom.trim()}>Add</button>
      </div>
    </div>
  );
}
