// Tags shown on builds, like META or UNDERRATED.
export const PRESET_TAGS = ["META", "UNDERRATED"];
export const MAX_TAGS = 4;
const MAX_TAG_LENGTH = 20;

// Cleans a list of tags: trims, uppercases, removes blanks and duplicates,
// and keeps it to a sensible size. Used in the editor and again on the server.
export function cleanTags(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of input) {
    const tag = String(raw).trim().toUpperCase().slice(0, MAX_TAG_LENGTH);
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

// Which color a tag gets.
export function tagClass(tag) {
  if (tag === "META") return "tag-meta";
  if (tag === "UNDERRATED") return "tag-underrated";
  return "tag-custom";
}
