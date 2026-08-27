"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useOwnerMode } from "@/lib/ownerMode";

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

// Generates (once) and remembers a random id for this browser, used only
// to track which comments THIS browser has upvoted, so the same person
// can't upvote a comment twice. Not a real identity, just a local marker.
function getBrowserId() {
  let id = window.localStorage.getItem("browserId");
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem("browserId", id);
  }
  return id;
}

export default function CommentSection({ creatureId }) {
  const { isOwner, passcode } = useOwnerMode();
  const supabase = createClient();
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState("newest"); // "top" | "newest" | "oldest"
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [tick, setTick] = useState(0);
  const [postError, setPostError] = useState(null);

  useEffect(() => {
    const savedName = window.localStorage.getItem("displayName");
    if (savedName) setDisplayName(savedName);
    const savedCooldown = window.localStorage.getItem(`commentCooldown:${creatureId}`);
    if (savedCooldown) setCooldownUntil(Number(savedCooldown));
  }, [creatureId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("comments")
        .select("id, text, username, upvoted_by, created_at")
        .eq("creature_id", creatureId)
        .order("created_at", { ascending: false });
      if (!cancelled) setComments(data || []);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [creatureId, supabase]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownActive = Date.now() < cooldownUntil;
  const cooldownMinsLeft = Math.ceil((cooldownUntil - Date.now()) / 60000);

  async function postComment() {
    if (!draft.trim() || !displayName.trim() || cooldownActive) return;
    setPostError(null);
    window.localStorage.setItem("displayName", displayName.trim());

    const { data, error } = await supabase
      .from("comments")
      .insert({ creature_id: creatureId, username: displayName.trim(), text: draft.trim() })
      .select("id, text, username, upvoted_by, created_at")
      .single();

    if (error) {
      setPostError(error.message);
      return;
    }
    const until = Date.now() + COOLDOWN_MS;
    window.localStorage.setItem(`commentCooldown:${creatureId}`, String(until));
    setComments((prev) => [data, ...prev]);
    setCooldownUntil(until);
    setDraft("");
  }

  async function toggleUpvote(comment) {
    const browserId = getBrowserId();
    const has = (comment.upvoted_by || []).includes(browserId);
    const nextUpvotes = has
      ? comment.upvoted_by.filter((id) => id !== browserId)
      : [...(comment.upvoted_by || []), browserId];
    const { error } = await supabase.from("comments").update({ upvoted_by: nextUpvotes }).eq("id", comment.id);
    if (!error) {
      setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, upvoted_by: nextUpvotes } : c)));
    }
  }

  async function deleteComment(id) {
    const res = await fetch("/api/comments/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, passcode }),
    });
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== id));
  }

  const sorted = [...comments].sort((a, b) => {
    if (sortMode === "top") return (b.upvoted_by || []).length - (a.upvoted_by || []).length;
    if (sortMode === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (loading) return <div className="notes-text">Loading comments…</div>;

  return (
    <div>
      {comments.length > 1 && (
        <div className="sort-row">
          {[["top", "Top"], ["newest", "Newest"], ["oldest", "Oldest"]].map(([key, label]) => (
            <button
              key={key}
              className={`sort-btn ${sortMode === key ? "active" : ""}`}
              onClick={() => setSortMode(key)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {sorted.length === 0 && <div className="notes-text" style={{ marginTop: 0 }}>No comments yet.</div>}
      {sorted.map((c) => {
        const browserId = typeof window !== "undefined" ? getBrowserId() : null;
        const upvoted = browserId && (c.upvoted_by || []).includes(browserId);
        return (
          <div key={c.id} className="comment-item">
            <button className={`upvote-btn ${upvoted ? "upvoted" : ""}`} onClick={() => toggleUpvote(c)}>
              ▲ {(c.upvoted_by || []).length}
            </button>
            <div style={{ flex: 1 }}>
              <span className="comment-user">{c.username}</span>
              <p className="comment-text">{c.text}</p>
            </div>
            {isOwner && (
              <button className="btn-ghost" onClick={() => deleteComment(c.id)}>Delete</button>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 14 }}>
        <input
          placeholder="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={{ marginBottom: 8, width: "100%" }}
          maxLength={20}
        />
        <div className="comment-form-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={cooldownActive ? `You can comment again in ${cooldownMinsLeft} min` : "Add a comment…"}
            disabled={cooldownActive}
          />
          <button className="btn-primary" onClick={postComment} disabled={!draft.trim() || !displayName.trim() || cooldownActive}>
            {cooldownActive ? `Wait ${cooldownMinsLeft}m` : "Post"}
          </button>
        </div>
        {postError && <div className="error-text">{postError}</div>}
      </div>
    </div>
  );
}
