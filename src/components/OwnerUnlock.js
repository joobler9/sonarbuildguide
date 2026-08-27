"use client";

import { useEffect, useState } from "react";
import { useOwnerMode } from "@/lib/ownerMode";

export default function OwnerUnlock() {
  const { isOwner, setPasscode, clearPasscode } = useOwnerMode();
  const [showPrompt, setShowPrompt] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "k") {
        setShowPrompt(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!showPrompt) return null;

  return (
    <>
      <div className="profile-backdrop" onClick={() => setShowPrompt(false)} />
      <div className="profile-panel profile-panel-small">
        <div className="mod-form-label">Owner Access</div>
        {isOwner ? (
          <div>
            <p className="notes-text" style={{ marginTop: 0 }}>You're currently in owner mode on this browser.</p>
            <button className="btn-ghost" onClick={() => { clearPasscode(); setShowPrompt(false); }}>
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPasscode(input);
                  setShowPrompt(false);
                  setInput("");
                }
              }}
              style={{ width: "100%", marginBottom: 10 }}
              autoFocus
            />
            <button
              className="btn-primary"
              onClick={() => { setPasscode(input); setShowPrompt(false); setInput(""); }}
            >
              Unlock
            </button>
          </div>
        )}
        <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => setShowPrompt(false)}>
          Close
        </button>
      </div>
    </>
  );
}
