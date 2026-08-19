// Seeds the plushies table with the 85 known plushies. Safe to run more
// than once, existing plushies (matched by name) are skipped, not duplicated.
// Run with: npm run seed
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role key needed to bypass RLS for seeding
);

const PLUSHIES = [
  { name: "Horned Beetlefly Plushie", type: "Boost", effect: "Lowers take-off stamina cost by 50% on fliers/gliders. Stackable.", availability: "Permanent (Bugs Gacha)" },
  { name: "Magichorn Prongbug Plushie", type: "Boost", effect: "Adds 10% Health Regeneration. Stackable.", availability: "Permanent (Bugs Gacha)" },
  { name: "Oceanwing Plushie", type: "Boost", effect: "Gives a 1.5x buff to the Mudroll effect. Stackable.", availability: "Permanent (Bugs Gacha)" },
  { name: "Rock Plushie", type: "Boost", effect: "Increases stamina regeneration by 25%. Stackable.", availability: "Permanent (Plant Gacha)" },
  { name: "Stick Plushie", type: "Boost", effect: "Increases max stamina by 10%. Stackable.", availability: "Permanent (Plant Gacha)" },
  { name: "Succulant Plushie", type: "Boost", effect: "+2.5% to all movement speeds. Stackable.", availability: "Permanent (Plant Gacha)" },
  { name: "Aerix Plushie", type: "Boost", effect: "-10% growth time. Stackable.", availability: "Permanent (Hybrid Gacha)" },
  { name: "Aerodon Plushie", type: "Boost", effect: "15% slower thirst drain. Stackable.", availability: "Permanent (Hybrid Gacha)" },
  { name: "Euvatops Plushie", type: "Boost", effect: "15% slower hunger drain. Stackable.", availability: "Permanent (Hybrid Gacha)" },
  { name: "Octroma Plushie", type: "Mutation Chance", effect: "Doubles the base chance of an Age/Nesting Mutation, not traits. Cannot stack with itself.", availability: "General Event" },
  { name: "Cat Plushie", type: "Ailments", effect: "+1 Offensive Bleed on any creature, decreases damage by 2.5%. Stackable.", availability: "Halloween Event" },
  { name: "Cavity Critter Plushie", type: "Boost", effect: "20% chance for creatures that bite you to be knocked back. Cannot stack with itself.", availability: "Halloween Event" },
  { name: "Haunt Dragon Plushie", type: "Ailments", effect: "+0.5 offensive poison. Stackable.", availability: "Halloween Event" },
  { name: "Ghost Plushie", type: "Boost", effect: "Adds 7.5% bleed block. Stackable.", availability: "Halloween Event" },
  { name: "Magic Frog Plushie", type: "Mutation Chance", effect: "Chance to nest or grow a creature with the Bewitched mutation. Stackable.", availability: "Halloween Event" },
  { name: "Owl Plushie", type: "Boost", effect: "Increases nightvision to max. Stackable.", availability: "Halloween Event" },
  { name: "Pig-Lantern Plushie", type: "Ailments", effect: "Adds 0.5 Burn Attack, decreases damage by 2.5%. Stackable.", availability: "Halloween Event" },
  { name: "Stitch Head Plushie", type: "Mutation Chance", effect: "100% guaranteed chance to nest or grow a creature with the Stitch Mutation. Stackable.", availability: "Halloween Event" },
  { name: "Vampire Bat Plushie", type: "Ailments", effect: "+1 Defensive Bleed, decreases damage by 2.5%. Stackable.", availability: "Halloween Event" },
  { name: "Jammy Slug Plushie", type: "Ailments", effect: "Adds 0.5 defensive necropoison, reduces damage by 5%. Stackable.", availability: "Harvest Event" },
  { name: "Maple Leaflet Plushie", type: "Boost", effect: "Adds 22.5% injury block. Stackable.", availability: "Harvest Event" },
  { name: "Pie Chomper Plushie", type: "Boost", effect: "Adds serrated teeth, -25% health regen. Not stackable.", availability: "Harvest Event" },
  { name: "Blessed Bean Plushie", type: "Boost", effect: "Nest upgrade ingredients donated have a 50% chance to count as double. Not stackable.", availability: "Harvest Event" },
  { name: "Coal Plushie", type: "Boost", effect: "+3.5% weight. Stackable.", availability: "Winter Event" },
  { name: "Frost Dragon Plushie", type: "Boost", effect: "Adds 25% frostbite block, lowers Hunger and Thirst by 5%. Stackable.", availability: "Winter Event" },
  { name: "Ginger Snapper Plushie", type: "Ailments", effect: "Adds 0.5 defensive frostbite, -5% burn block. Non-stackable.", availability: "Winter Event" },
  { name: "Ice Wolf Plushie", type: "Boost", effect: "+5% damage. Stackable.", availability: "Winter Event" },
  { name: "Minty Wiggler Plushie", type: "Ability Grant", effect: "Grants the Frosty ability. Non-stackable.", availability: "Winter Event" },
  { name: "Partridge Plushie", type: "Boost", effect: "+20% max stamina, -2% speed. Stackable.", availability: "Winter Event" },
  { name: "Reindeer Plushie", type: "Boost", effect: "+0.5 glide regeneration and +2.5% flight speed. Stackable.", availability: "Winter Event" },
  { name: "Snowflake Sneak Plushie", type: "Boost", effect: "Reduces radial sound detection and footstep audio by 50%. Not stackable.", availability: "Winter Event" },
  { name: "Snowman Plushie", type: "Boost", effect: "Freezes the creature's age, preventing it from growing up. Not stackable.", availability: "Winter Event" },
  { name: "Tannenbaum Plushie", type: "Ailments", effect: "Adds 0.5 frostbite attack, +5% bite cooldown. Not stackable.", availability: "Winter Event" },
  { name: "Heart Plushie", type: "Boost", effect: "+30% health regeneration, -5% weight. Stackable.", availability: "Valentine's Event" },
  { name: "Heartsnake Plushie", type: "Ailments", effect: "Adds +1 Defensive Poison. Stackable.", availability: "Valentine's Event" },
  { name: "Rosevine Plushie", type: "Boost", effect: "+10% extra healing done by Healing Hunter abilities. Non-stackable.", availability: "Valentine's Event" },
  { name: "Swan Plushie", type: "Ability Grant", effect: "Grants the Agile Swimmer ability, -25% stamina regeneration. Not stackable.", availability: "Valentine's Event" },
  { name: "Clover Blossom Plushie", type: "Boost", effect: "Grants a large Satiated buff stack whenever you drink water. Non-stackable.", availability: "Spring Meadows Event" },
  { name: "Golden Bulb Plushie", type: "Mutation Chance", effect: "Adds a chance to nest or grow a creature with the Fool's Gold mutation. Stackable.", availability: "Spring Meadows Event" },
  { name: "Bunny Plushie", type: "Boost", effect: "+10% to ambush multiplier, only if the creature already has ambush. Stackable.", availability: "Easter Event" },
  { name: "Chick Plushie", type: "Boost", effect: "+5% to all movement speeds, -7.5% weight. Stackable.", availability: "Easter Event" },
  { name: "Cow Plushie", type: "Boost", effect: "+10% weight, decreases damage by 5%. Stackable.", availability: "Easter Event" },
  { name: "Egg Shell Plushie", type: "Boost", effect: "Speeds up gestation period by 1.5x. Non-stackable.", availability: "Easter Event" },
  { name: "Egg Gobbler Plushie", type: "Boost", effect: "Reduces material costs for nest upgrades by 50%. Cannot stack.", availability: "Easter Event" },
  { name: "Eggy Snake Plushie", type: "Ability Grant", effect: "Grants the Egg Stealer ability. Not stackable.", availability: "Easter Event" },
  { name: "Jackrabbit Plushie", type: "Boost", effect: "Reduces stamina needed for jumping by 25%. Stackable.", availability: "Easter Event" },
  { name: "Springram Plushie", type: "Boost", effect: "1.5x Satiated buff when eating food. Stackable.", availability: "Easter Event" },
  { name: "Catalyst Plushie", type: "Mutation Chance", effect: "10% chance to become the BloodMoon mutation by nesting or growing up. Does not stack.", availability: "Disaster Event" },
  { name: "Eclipse Plushie", type: "Boost", effect: "+5% damage, +25% stamina regen, +15% health regen. Only applies at night. Stackable.", availability: "Disaster Event" },
  { name: "Darkstar Plushie", type: "Boost", effect: "Increases healing rate of debuff ailments by 25% while sitting or laying. Cannot stack.", availability: "LSS Event" },
  { name: "Elemental Plushie", type: "Mutation Chance", effect: "10% chance to be born or grown with the Elemental mutation. Not stackable.", availability: "LSS Event" },
  { name: "Knight Plushie", type: "Boost", effect: "25% chance to reflect 20% of incoming damage, -5% own base damage. Cannot stack with itself.", availability: "LSS Event" },
  { name: "Land Plushie", type: "Boost", effect: "+100% duration on Mud and hidden scent effects. Stackable.", availability: "LSS Event" },
  { name: "Sea Plushie", type: "Boost", effect: "+10% walking speed, +10% beached speed. Stackable.", availability: "LSS Event" },
  { name: "Sky Plushie", type: "Boost", effect: "+2 flight speed, -10% weight. Stackable.", availability: "LSS Event" },
  { name: "Void Plushie", type: "Boost", effect: "+7.5% damage, -2.5% to all movement speeds. Stackable.", availability: "LSS Event" },
  { name: "Sparkler Plushie", type: "Boost", effect: "+15% poison/frostbite/burn block, -20% bleed block. Non-stackable.", availability: "Fireworks Event" },
  { name: "Clownfish Plushie", type: "Mutation Chance", effect: "Chance to become the Clownfish mutation by growing up or nesting. Stackable.", availability: "Summer Paradise Event" },
  { name: "Goldfish Plushie", type: "Boost", effect: "Applies the Iron Stomach ability. Non-stackable.", availability: "Summer Paradise Event" },
  { name: "Palmtree Plushie", type: "Boost", effect: "+10% to Hunger and Thirst capacity. Stackable.", availability: "Summer Paradise Event" },
  { name: "Serpent Plushie", type: "Boost", effect: "Decreases turn radius, decreases damage by 10%. Not stackable.", availability: "Summer Paradise Event" },
  { name: "Icebreaker Plushie", type: "Boost", effect: "Buffs the Charge ability's knockback multiplier by 0.25. Non-stackable.", availability: "Lore Event" },
  { name: "Baby Dragon Plushie", type: "Boost", effect: "+20% boost to breath ability recharge rate. Cannot stack with itself.", availability: "Land of Monsters Event" },
  { name: "Bear Plushie", type: "Boost", effect: "Boosts the Aggro and Cower emote buffs by +10%. Not stackable.", availability: "Amazon's Joyful Horizons Event" },
  { name: "Fox Plushie", type: "Boost", effect: "Lets burrowers place an extra burrow, +30% ailment healing rate and +5% health regen while in a burrow. Not stackable.", availability: "Amazon's Joyful Horizons Event" },
  { name: "Dolt Plushie", type: "Ability Grant", effect: "Grants a double-jump, -15% stamina cost on the first jump. Cannot stack with itself.", availability: "Mini-Might Takeover Event" },
  { name: "Hum Plushie", type: "Ability Grant", effect: "Grants a double-jump, +2.5% weight. Cannot stack with itself.", availability: "Mini-Might Takeover Event" },
  { name: "Knox Plushie", type: "Ability Grant", effect: "Grants a double-jump, +5% walk speed. Cannot stack with itself.", availability: "Mini-Might Takeover Event" },
  { name: "Mo Plushie", type: "Ability Grant", effect: "Grants a double-jump, +2.5% damage. Cannot stack with itself.", availability: "Mini-Might Takeover Event" },
  { name: "Rod Plushie", type: "Ability Grant", effect: "Grants a double-jump, +10% health regen. Cannot stack with itself.", availability: "Mini-Might Takeover Event" },
  { name: "Arcane Plushie", type: "Boost", effect: "+12.5% breath damage. Creature must have a breath ability. Non-stackable.", availability: "Weekly Mission (rotating)" },
  { name: "Seal Plushie", type: "Boost", effect: "+15% Moisture for creatures that have a moisture stat. Stackable.", availability: "Weekly Mission (rotating)" },
  { name: "Springbok Plushie", type: "Ability Grant", effect: "Grants the Will To Live passive ability. Non-stackable.", availability: "Weekly Mission (rotating)" },
  { name: "Creator Star Plushie", type: "Mutation Chance", effect: "Unlocks a celestial mutation with a high chance to pass it on through growth or nesting. Not stackable.", availability: "Content Creator role only" },
  { name: "Astral Quetzal Plushie", type: "Boost", effect: "50% resistance against breaths and bleed, -7.5% to all movement speeds. Non-stackable.", availability: "Redeem Code (limited time)" },
  { name: "Ember Spirit Plushie", type: "Ailments", effect: "Adds 0.5 defensive burn, -7.5% frostbite block. Stackable.", availability: "Redeem Code (limited time)" },
  { name: "Smore Cat Plushie", type: "Mutation Chance", effect: "10% chance to nest or grow a creature with the Smores mutation. Stackable.", availability: "Redeem Code (limited time)" },
  { name: "Mylo Plushie", type: "Boost", effect: "Applies the Mylo material palette look, +2.5% movement speed. Stackable.", availability: "UGC (linked item)" },
  { name: "Jotun Scale Plushie", type: "Boost", effect: "Reduces damage taken by 15% when grabbed. Stackable.", availability: "Merchandise (Jotunhel Keychain)" },
  { name: "Humming Frost Plushie", type: "Boost", effect: "Reduces stamina drain by 50% while hovering. Stackable.", availability: "Merchandise (Frosflit Travel Mug)" },
  { name: "Vile Thorn Plushie", type: "Mutation Chance", effect: "Gives a chance for hatched or age-67 growth to become the Vile Bloom mutation. Not stackable.", availability: "Valentine's Event" },
  { name: "Lucky Lamb Plushie", type: "Mutation Chance", effect: "Small chance for a hatched nest player to become Woolborne, or for growth to age 67 to become Woolborne mutated. Not stackable.", availability: "Easter Event" },
  { name: "Floraegge Plushie", type: "Boost", effect: "Donating a Lily or Lily Petal to a nest boosts current egg progression by 10%. Stackable.", availability: "Merchandise (Moonelle Gacha Pins)" },
  { name: "Lunar Qilin Plushie", type: "Boost", effect: "Adds 70% soft landing when equipped. Stackable.", availability: "Merchandise (Shiziyou Sweater)" },
  { name: "Verdanette Plushie", type: "Boost", effect: "While under the Muddy status, applies -15% growth time. Stackable.", availability: "Merchandise (Verdant Warden Canvas)" },
];

async function seed() {
  console.log(`Seeding ${PLUSHIES.length} plushies...`);
  const { data, error } = await supabase
    .from("plushies")
    .upsert(PLUSHIES, { onConflict: "name", ignoreDuplicates: true });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
  console.log("Done.");
}

seed();
