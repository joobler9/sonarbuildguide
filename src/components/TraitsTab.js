"use client";

const TRAITS = [
  { name: "Bite", category: "Combat", effect: "+10% faster bite cooldown, letting you attack more often." },
  { name: "Damage", category: "Combat", effect: "+5% attack damage." },
  { name: "Weight", category: "Combat", effect: "+5% weight." },
  { name: "Health", category: "Recovery", effect: "+12.5% health regeneration rate, not max health." },
  { name: "Stamina Regen", category: "Recovery", effect: "+20% stamina regeneration, including in-glide stamina regeneration." },
  { name: "Healing", category: "Recovery", effect: "+5% healing done to other creatures via Heal Breath or Heal Beam." },
  { name: "Speed", category: "Mobility", effect: "+3.5% to walk, sprint, swim, and fly speed." },
  { name: "Max Stamina", category: "Mobility", effect: "+15% total stamina." },
];

const CATEGORY_COLOR = { Combat: "var(--trait-red)", Recovery: "var(--trait-green)", Mobility: "var(--trait-blue)" };

export default function TraitsTab() {
  return (
    <div>
      <div className="grid-cards">
        {TRAITS.map((t) => (
          <div key={t.name} className="info-card" style={{ borderColor: CATEGORY_COLOR[t.category] }}>
            <div className="info-card-top">
              <h3 className="info-name">{t.name}</h3>
              <span className="tag-pill" style={{ borderColor: CATEGORY_COLOR[t.category], color: CATEGORY_COLOR[t.category] }}>
                {t.category}
              </span>
            </div>
            <p className="notes-text" style={{ marginTop: 0 }}>{t.effect}</p>
          </div>
        ))}
      </div>
      <div className="footer-note" style={{ marginTop: 20 }}>
        Each creature can gain up to two traits total, one at age 66 and one at age 100. Nested creatures have a 100%
        chance of getting both. Once a creature has two, that's permanent for its lifetime.
      </div>
    </div>
  );
}
