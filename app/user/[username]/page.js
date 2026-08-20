"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function UserProfilePage() {
  const { username } = useParams();
  const { user, supabase } = useAuth();
  const [profile, setProfile] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [iFollowThem, setIFollowThem] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    setLoading(true);
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, username, role")
      .eq("username", username)
      .single();

    if (!profileData) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setProfile(profileData);

    const { count: followers } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profileData.id);
    setFollowersCount(followers || 0);

    const { count: following } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profileData.id);
    setFollowingCount(following || 0);

    if (user) {
      const { data: existingFollow } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", profileData.id)
        .maybeSingle();
      setIFollowThem(!!existingFollow);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, user]);

  async function toggleFollow() {
    if (!user || !profile || busy) return;
    setBusy(true);
    if (iFollowThem) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.id);
      setIFollowThem(false);
      setFollowersCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.id });
      setIFollowThem(true);
      setFollowersCount((c) => c + 1);
    }
    setBusy(false);
  }

  if (loading) return <div className="page-wrap"><div className="notes-text">Loading profile…</div></div>;

  if (!profile) {
    return (
      <div className="page-wrap">
        <div className="notes-text">No user found with that name.</div>
      </div>
    );
  }

  const isOwnProfile = user && user.id === profile.id;

  return (
    <div className="page-wrap">
      <div className="glow-card">
        <div className="glow-card-body">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div className="logo-orb" style={{ width: 64, height: 64, fontSize: 22 }}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="creature-name">
                {profile.username}
                {profile.role !== "user" && <span className="role-badge" style={{ marginLeft: 10 }}>{profile.role}</span>}
              </h2>
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 13, color: "var(--ink-dim)" }}>
                <span><strong style={{ color: "var(--ink)" }}>{followersCount}</strong> Followers</span>
                <span><strong style={{ color: "var(--ink)" }}>{followingCount}</strong> Following</span>
              </div>
            </div>
            {!isOwnProfile && user && (
              <button className={iFollowThem ? "btn-ghost" : "btn-primary"} onClick={toggleFollow} disabled={busy}>
                {iFollowThem ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
