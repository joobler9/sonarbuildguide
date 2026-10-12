// When a plushie or trait is renamed, creatures that list the old name would
// be left pointing at something that no longer exists. This swaps the old
// name for the new one everywhere it appears.
// Loads the rows and checks in code (rather than a database array filter)
// so unusual characters in a name can't break the match.
export async function renameInCreatures(supabase, column, oldName, newName) {
  const { data, error } = await supabase.from("creatures").select(`id, ${column}`);
  if (error || !data) return;
  for (const row of data) {
    const list = row[column] || [];
    if (!list.includes(oldName)) continue;
    const next = list.map((v) => (v === oldName ? newName : v));
    await supabase.from("creatures").update({ [column]: next }).eq("id", row.id);
  }
}
