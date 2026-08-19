"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import CreaturesBrowser from "@/components/CreaturesBrowser";
import PlushiesTab from "@/components/PlushiesTab";

export default function HomePage() {
  const { user, profile, loading, supabase } = useAuth();
  const [tab, setTab] = useState("builds"); // "builds" | "plushies"

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Sonaria Build Guide</h1>
        <div>
          {loading ? null : user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span>
                {profile?.username}
                {profile?.role && profile.role !== "user" && (
                  <span style={{ marginLeft: 6, fontSize: 10, color: "#F2C94C", textTransform: "uppercase" }}>
                    {profile.role}
                  </span>
                )}
              </span>
              <button onClick={handleLogout}>Log out</button>
            </div>
          ) : (
            <Link href="/login">Sign In</Link>
          )}
        </div>
      </header>

      <nav style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setTab("builds")} style={{ fontWeight: tab === "builds" ? 700 : 400 }}>
          Builds
        </button>
        <button onClick={() => setTab("plushies")} style={{ fontWeight: tab === "plushies" ? 700 : 400 }}>
          Plushies
        </button>
      </nav>

      {tab === "builds" && <CreaturesBrowser />}
      {tab === "plushies" && <PlushiesTab />}

      <footer style={{ marginTop: 40, fontSize: 12, color: "#888" }}>
        Fan-made project, not affiliated with Creatures of Sonaria's developers.
      </footer>
    </div>
  );
}
