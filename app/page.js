"use client";

import { useRef, useState } from "react";
import CreaturesBrowser from "@/components/CreaturesBrowser";
import PlushiesTab from "@/components/PlushiesTab";
import TraitsTab from "@/components/TraitsTab";
import OwnerUnlock from "@/components/OwnerUnlock";
import { useOwnerMode } from "@/lib/ownerMode";

export default function HomePage() {
  const { isOwner } = useOwnerMode();
  const [tab, setTab] = useState("builds"); // "builds" | "traits" | "plushies"
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  // Phone-friendly way into owner mode: tap the logo 5 times quickly.
  function handleLogoTap() {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      window.dispatchEvent(new Event("open-owner-unlock"));
    }
  }

  return (
    <div className="page-wrap">
      <header className="site-header">
        <div className="header-spacer" />
        <div className="site-title-row">
          <div className="logo-orb" onClick={handleLogoTap}>JB</div>
          <div>
            <h1 className="site-title">Joobs Build Guides</h1>
            <p className="site-subtitle">Unofficial fan tool for builds, traits, and plushies.</p>
          </div>
        </div>
        <div className="identity-row">
          {isOwner && <span className="role-badge">Owner Mode</span>}
        </div>
      </header>

      <div className="tab-row">
        <button className={`tab-btn tab-cyan ${tab === "builds" ? "active" : ""}`} onClick={() => setTab("builds")}>
          Builds
        </button>
        <button className={`tab-btn tab-cyan ${tab === "traits" ? "active" : ""}`} onClick={() => setTab("traits")}>
          Traits
        </button>
        <button className={`tab-btn tab-gold ${tab === "plushies" ? "active" : ""}`} onClick={() => setTab("plushies")}>
          Plushies
        </button>
      </div>

      {tab === "builds" && <CreaturesBrowser />}
      {tab === "traits" && <TraitsTab />}
      {tab === "plushies" && <PlushiesTab />}

      <div className="footer-note">
        Fan-made project, not affiliated with Creatures of Sonaria's developers.
      </div>
      <div className="legal-links-row">
        <a href="/legal/disclaimer">Disclaimer</a>
        <span>·</span>
        <a href="/legal/privacy">Privacy Policy</a>
        <span>·</span>
        <a href="/legal/terms">Terms of Service</a>
        <span>·</span>
        <a href="/legal/guidelines">Community Guidelines</a>
      </div>

      <OwnerUnlock />
    </div>
  );
}
