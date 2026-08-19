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

  // A comment can be deleted by its own author, OR by any moderator/admin.
  // The database's row-level security policy enforces this same rule
  // server-side too, so this isn't just a UI-level restriction.
  async function deleteComment(id) {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) return <div>Loading comments…</div>;

  return (
    <div>
      <h3>Comments ({comments.length})</h3>
      {comments.map((c) => {
        const canDelete = user && (c.user_id === user.id || isModerator);
        return (
          <div key={c.id} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #222" }}>
            <div style={{ flex: 1 }}>
              <strong>{c.profiles?.username || "Unknown"}</strong>
              {isModerator && c.user_id !== user?.id && (
                <span style={{ fontSize: 10, color: "#F2C94C", marginLeft: 6 }}>MOD VIEW</span>
              )}
              <p style={{ margin: "2px 0 0" }}>{c.text}</p>
            </div>
            {canDelete && (
              <button onClick={() => deleteComment(c.id)} title={c.user_id === user?.id ? "Delete your comment" : "Delete as moderator"}>
                Delete
              </button>
            )}
          </div>
        );
      })}

      {user ? (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a comment…" style={{ flex: 1 }} />
          <button onClick={postComment} disabled={!draft.trim()}>Post</button>
        </div>
      ) : (
        <p style={{ color: "#888" }}>Log in to comment.</p>
      )}
    </div>
  );
}
