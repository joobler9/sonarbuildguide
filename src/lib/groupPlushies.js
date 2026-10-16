// Groups plushies into sections by where they come from.
//
// - "Merchandise (Frosflit Travel Mug)" and "Merchandise (Jotunhel Keychain)"
//   share one "Merchandise" section; the part in brackets is kept on the card.
// - Sources with fewer than MIN_GROUP plushies go into one "Other" section,
//   and each of those cards keeps its full source text.
// Sections are decided from the FULL list, so searching never makes a plushie
// jump between sections.
export const OTHER = "Other";
const MIN_GROUP = 3;

function baseOf(availability) {
  return (availability || "").split(" (")[0].trim();
}

function rank(name) {
  if (name === OTHER) return 9;
  if (/event/i.test(name)) return 0;
  if (/^permanent/i.test(name)) return 1;
  if (/^(weekly mission|redeem code)/i.test(name)) return 2;
  return 3;
}

export function groupPlushies(plushies) {
  const counts = {};
  for (const p of plushies) {
    const b = baseOf(p.availability);
    counts[b] = (counts[b] || 0) + 1;
  }

  const sections = {};
  for (const p of plushies) {
    const full = p.availability || "";
    const b = baseOf(full);
    const small = counts[b] < MIN_GROUP;
    const key = small ? OTHER : b;
    const detail = small
      ? full
      : full.slice(b.length).replace(/^\s*\(/, "").replace(/\)\s*$/, "").trim();
    (sections[key] = sections[key] || []).push({ ...p, _detail: detail });
  }

  return Object.keys(sections)
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .map((name) => ({
      name,
      items: sections[name].sort((x, y) => x.name.localeCompare(y.name)),
    }));
}
