"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { DEFAULT_TRAITS } from "@/lib/traitsData";

// Loads traits from the database. Falls back to the built-in list if the
// traits table doesn't exist yet, so the site never breaks before the
// migration has been run.
export function useTraits() {
  const supabase = createClient();
  const [traits, setTraits] = useState(DEFAULT_TRAITS);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("traits")
      .select("id, name, category, effect, sort_order")
      .order("sort_order")
      .order("name");
    if (!error && data && data.length > 0) setTraits(data);
  }, [supabase]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { traits, reload };
}
