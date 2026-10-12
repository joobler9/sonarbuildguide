"use client";

import { useEffect, useState } from "react";
import { useOwnerMode } from "@/lib/ownerMode";

export default function OwnerUnlock() {
  const { isOwner, setPasscode, clearPasscode } = useOwnerMode();
  const [showPrompt, setShowPrompt] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "k") {
        setShowPrompt(true);
      }
    }
    function handleOpenEvent() {
      setShowPrompt(true);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-owner-unlock", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-owner-unlock", handleOpenEvent);
    };
  }, []);

  function close() {
    setShowPrompt(false);
    setInput("");
    setError(null);
  }

  // Checks the passcode with the server first. Only a correct one unlocks.
  async function tryUnlock() {
    if (!input.trim() || checking) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: input }),
      });
      if (res.ok) {
        setPasscode(input);
        close();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Incorrect passcode.");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    }
    setChecking(false);
  }

  if (!showPrompt) return null;

  return (
    <>
      <div className="profile-backdrop" onClick={close} />
      <div className="profile-panel profile-panel-small">
        <div className="mod-form-label">Owner Access</div>
        {isOwner ? (
          <div>
            <p className="notes-text" style={{ marginTop: 0 }}>You're currently in owner mode on this browser.</p>
            <button className="btn-ghost" onClick={() => { clearPasscode(); close(); }}>
              Log out of owner mode
            </button>
          </div>
        ) : (
          <div>
            <input
              type="password"
              placeholder="Enter passcode"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") tryUnlock(); }}
              style={{ width: "100%", marginBottom: 10 }}
              autoFocus
            />
            {error && <div className="error-text" style={{ marginBottom: 10 }}>{error}</div>}
            <button className="btn-primary" onClick={tryUnlock} disabled={checking || !input.trim()}>
              {checking ? "Checking…" : "Unlock"}
            </button>
          </div>
        )}
        <button className="btn-ghost" style={{ marginTop: 8 }} onClick={close}>
          Close
        </button>
      </div>
    </>
  );
}
