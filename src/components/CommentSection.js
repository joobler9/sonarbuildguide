"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export default function CommentSection({ creatureId }) {
  const { user, profile, isModerator, supabase } = useAuth();
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState("newest"); // "top" | "newest" | "oldest"
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [tick, setTick] = useState(0);
  const [postError, setPostError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("comments")
        .select("id, text, user_id, upvoted_by, created_at, profiles(username)")
        .eq("creature_id", creatureId)
        .order("created_at", { ascending: false });
      if (!cancelled) setComments(data || []);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [creatureId, supabase]);

  // Cooldown comes from the real last_comment_at on the user's own profile,
  // so it survives page reloads and can't be reset by refreshing.
  useEffect(() => {
    if (profile?.last_comment_at) {
      setCooldownUntil(new Date(profile.last_comment_at).getTime() + COOLDOWN_MS);
    }
  }, [profile]);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownActive = Date.now() < cooldownUntil;
  const cooldownMinsLeft = Math.ceil((cooldownUntil - Date.now()) / 60000);

  async function postComment() {
    if (!draft.trim() || !user || cooldownActive) return;
    setPostError(null);
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("comments")
      .insert({ creature_id: creatureId, user_id: user.id, text: draft.trim() })
      .select("id, text, user_id, upvoted_by, created_at, profiles(username)")
      .single();
    if (error) {
      setPostError(error.message);
      return;
    }
    await supabase.from("profiles").update({ last_comment_at: now }).eq("id", user.id);
    setComments((prev) => [data, ...prev]);
    setCooldownUntil(Date.now() + COOLDOWN_MS);
    setDraft("");
  }

  async function toggleUpvote(comment) {
    if (!user) return;
    const has = (comment.upvoted_by || []).includes(user.id);
    const nextUpvotes = has
      ? comment.upvoted_by.filter((id) => id !== user.id)
      : [...(comment.upvoted_by || []), user.id];
    const { error } = await supabase.from("comments").update({ upvoted_by: nextUpvotes }).eq("id", comment.id);
    if (!error) {
      setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, upvoted_by: nextUpvotes } : c)));
    }
  }

  async function deleteComment(id) {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== id));
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
        const canDelete = user && (c.user_id === user.id || isModerator);
        const upvoted = user && (c.upvoted_by || []).includes(user.id);
        return (
          <div key={c.id} className="comment-item">
            <button className={`upvote-btn ${upvoted ? "upvoted" : ""}`} onClick={() => toggleUpvote(c)} disabled={!user}>
              ▲ {(c.upvoted_by || []).length}
            </button>
            <div style={{ flex: 1 }}>
              <Link href={`/user/${c.profiles?.username}`} className="comment-user">
                {c.profiles?.username || "Unknown"}
              </Link>
              {isModerator && c.user_id !== user?.id && <span className="mod-view-tag">MOD VIEW</span>}
              <p className="comment-text">{c.text}</p>
            </div>
            {canDelete && (
              <button className="btn-ghost" onClick={() => deleteComment(c.id)}>Delete</button>
            )}
          </div>
        );
      })}

      {user ? (
        <div style={{ marginTop: 14 }}>
          <div className="comment-form-row">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={cooldownActive ? `You can comment again in ${cooldownMinsLeft} min` : "Add a comment…"}
              disabled={cooldownActive}
            />
            <button className="btn-primary" onClick={postComment} disabled={!draft.trim() || cooldownActive}>
              {cooldownActive ? `Wait ${cooldownMinsLeft}m` : "Post"}
            </button>
          </div>
          {postError && <div className="error-text">{postError}</div>}
        </div>
      ) : (
        <p className="notes-text">Log in to comment.</p>
      )}
    </div>
  );
}
