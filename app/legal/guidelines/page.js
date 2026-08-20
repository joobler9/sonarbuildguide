import LegalPageLayout from "@/components/LegalPageLayout";

const SECTIONS = [
  ["Purpose", "These guidelines exist to keep this a safe, respectful place to talk about builds. They apply to your username, comments, and anywhere else you interact on this site."],
  ["Be respectful", "Hateful, degrading, or discriminatory language toward anyone or any group isn't allowed here, including based on things like race, religion, gender, sexual orientation, or disability."],
  ["No harassment", "Don't target another user with abuse, threats, or repeated unwanted contact."],
  ["Keep it appropriate", "This site is used by a wide range of ages. Sexually explicit, sexually suggestive, or graphically violent content has no place here, in usernames or comments."],
  ["No spam", "Don't flood comments with repeated content, and don't use this site to advertise unrelated Discord servers, other websites, or services."],
  ["Enforcement", "This is a small, independently run project, not a platform with a dedicated moderation team. If something violates these guidelines, we may remove it and, for serious or repeated issues, restrict someone's ability to use the site. If you want to report something or have a concern, email joobler9@gmail.com."],
];

export default function GuidelinesPage() {
  return <LegalPageLayout title="Community Guidelines" sections={SECTIONS} />;
}
