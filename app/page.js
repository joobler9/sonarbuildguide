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
    <div className="page-wrap">
      <header className="site-header">
        <div className="site-title-row">
          <div className="logo-orb">JB</div>
          <div>
            <h1 className="site-title">Joobs Build Guides</h1>
            <p className="site-subtitle">Unofficial fan tool for builds, traits, and plushies.</p>
          </div>
        </div>
        <div className="identity-row">
          {loading ? null : user ? (
            <>
              <span>
                {profile?.username}
                {profile?.role && profile.role !== "user" && (
                  <span className="role-badge" style={{ marginLeft: 8 }}>{profile.role}</span>
                )}
              </span>
              <button className="btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <Link href="/login" className="btn-primary" style={{ textDecoration: "none" }}>Sign In</Link>
          )}
        </div>
      </header>

      <div className="tab-row">
        <button className={`tab-btn tab-cyan ${tab === "builds" ? "active" : ""}`} onClick={() => setTab("builds")}>
          Builds
        </button>
        <button className={`tab-btn tab-gold ${tab === "plushies" ? "active" : ""}`} onClick={() => setTab("plushies")}>
          Plushies
        </button>
      </div>

      {tab === "builds" && <CreaturesBrowser />}
      {tab === "plushies" && <PlushiesTab />}

      <div className="footer-note">
        Fan-made project, not affiliated with Creatures of Sonaria's developers.
      </div>
    </div>
  );
}
