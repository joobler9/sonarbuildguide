"use client";

import { createContext, useContext, useEffect, useState } from "react";

const OwnerModeContext = createContext(null);

// The passcode is remembered in this browser via localStorage so you don't
// have to retype it every visit. This is just a convenience, NOT the real
// security boundary — every actual add/edit/delete request sends this
// passcode to a server route that checks it against the real value kept
// only in Vercel's environment variables, and the database is only ever
// touched after that server-side check passes.
export function OwnerModeProvider({ children }) {
  const [passcode, setPasscodeState] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("ownerPasscode");
    if (saved) setPasscodeState(saved);
  }, []);

  function setPasscode(value) {
    setPasscodeState(value);
    window.localStorage.setItem("ownerPasscode", value);
  }

  function clearPasscode() {
    setPasscodeState("");
    window.localStorage.removeItem("ownerPasscode");
  }

  return (
    <OwnerModeContext.Provider value={{ passcode, setPasscode, clearPasscode, isOwner: !!passcode }}>
      {children}
    </OwnerModeContext.Provider>
  );
}

export function useOwnerMode() {
  const ctx = useContext(OwnerModeContext);
  if (!ctx) throw new Error("useOwnerMode must be used within an OwnerModeProvider");
  return ctx;
}
