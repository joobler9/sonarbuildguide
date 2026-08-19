"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";

export default function CommentSection({ creatureId }) {
  const { user, profile, isModerator, supabase } = useAuth();
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

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

  async function postComment() {
    if (!draft.trim() || !user) return;
    const { data, error } = await supabase
      .from("comments")
      .insert({ creature_id: creatureId, user_id: user.id, text: draft.trim() })
      .select("id, text, user_id, upvoted_by, created_at, profiles(username)")
      .single();
    if (!error && data) {
      setComments((prev) => [data, ...prev]);
      setDraft("");
    }
  }

  async function deleteComment(id) {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) return <div className="notes-text">Loading comments…</div>;

  return (
    <div>
      {comments.length === 0 && <div className="notes-text" style={{ marginTop: 0 }}>No comments yet.</div>}
      {comments.map((c) => {
        const canDelete = user && (c.user_id === user.id || isModerator);
        return (
          <div key={c.id} className="comment-item">
            <div style={{ flex: 1 }}>
              <span className="comment-user">{c.profiles?.username || "Unknown"}</span>
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
        <div className="comment-form-row">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a comment…" />
          <button className="btn-primary" onClick={postComment} disabled={!draft.trim()}>Post</button>
        </div>
      ) : (
        <p className="notes-text">Log in to comment.</p>
      )}
    </div>
  );
}
