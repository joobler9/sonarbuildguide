import LegalPageLayout from "@/components/LegalPageLayout";

const SECTIONS = [
  ["Unofficial fan project", "This site is an unofficial, fan-made resource for Creatures of Sonaria. It is not created, operated, endorsed, or sponsored by the developers of Creatures of Sonaria, Roblox Corporation, or any affiliated party."],
  ["Trademarks and assets", "Creatures of Sonaria, its creature names, and all related assets are the property of their respective owners. This site does not claim ownership of any of that intellectual property. Any names or references used here are for identification purposes only."],
  ["Data accuracy", "Stats, trait percentages, plushie effects, and other information on this site are compiled from community knowledge and testing. They may contain errors, may be incomplete, and may fall out of date as the game changes. Nothing here should be treated as an official or guaranteed source. If you find an inaccuracy, community corrections are welcome."],
  ["No affiliation implied", "Any mention of official terminology, mechanics, or game features is purely descriptive and does not imply partnership with or approval from the game's developers."],
  ["Rights holder requests", "If you're a representative of Creatures of Sonaria's developers or another rights holder and have a concern about content on this site, we'll respond promptly and in good faith. Reach out to joobler9@gmail.com with details of the concern."],
];

export default function DisclaimerPage() {
  return <LegalPageLayout title="Disclaimer" sections={SECTIONS} />;
}
