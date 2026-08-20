"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "./supabase-browser";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { id, username, role }
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, username, role, last_comment_at")
          .eq("id", session.user.id)
          .single();
        if (!cancelled) setProfile(profileData);
      }
      if (!cancelled) setLoading(false);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, username, role, last_comment_at")
          .eq("id", session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // isModerator is true for both 'moderator' and 'admin' roles, since admins
  // can do everything a moderator can, plus more (like promoting others).
  const isModerator = profile?.role === "moderator" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, profile, loading, isModerator, isAdmin, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
