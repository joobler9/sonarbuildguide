import LegalPageLayout from "@/components/LegalPageLayout";

const SECTIONS = [
  ["Who runs this site", "This site is an independent fan project run by an individual, not a registered company. The contact for anything in this policy is joobler9@gmail.com."],
  ["What we collect", "When you use this site, we store: a username and email you provide when creating a real account, comments and upvotes you post, and who you follow."],
  ["Services we use", "This site relies on a small number of outside services to run: a backend hosting and authentication provider (Supabase) to save site data and manage accounts, and an advertising network to display ads. These providers only receive the data needed to do their job, and each has their own privacy practices for the parts of the process they handle."],
  ["Technical data", "Like most websites, the hosting behind this site may automatically log basic technical information when you visit, such as your IP address, browser type, and which pages you view. This happens at the infrastructure level, is standard practice, and isn't used by us for anything beyond keeping the site running properly."],
  ["How it's used", "This information is used only to operate the features of the site: signing you in, showing your profile to others, and displaying your comments. We do not sell your data, and we do not use it for anything beyond running the site's features."],
  ["Visibility", "Your username and comments are visible to anyone using the site. Your email address is never shown publicly."],
  ["Advertising and cookies", "This site may display third-party advertisements. Ad providers such as Google may use cookies or similar technology to show relevant ads and may collect data like your IP address or browsing activity for that purpose. We don't control what data ad providers collect; you can review their own privacy practices directly, for example Google's at policies.google.com/privacy, and most browsers let you block or clear cookies if you'd rather not have them."],
  ["Data retention and deletion", "You can delete your own comments at any time from within the site. To request deletion of your account entirely, email joobler9@gmail.com."],
  ["Security", "We take reasonable steps to protect the information on this site, but no method of storing or transmitting data online is ever fully secure. If you have reason to believe your information here has been compromised, please let us know."],
  ["If you're outside Australia", "This site is based in and primarily governed by Australian law, and isn't built around the specific requirements of frameworks like the EU's GDPR or California's CCPA. If you're located somewhere with additional data protection rights under local law, you're welcome to contact us about your information and we'll do our best to accommodate reasonable requests, but we can't guarantee full compliance with every regional framework."],
  ["Children's privacy", "This site is not directed at young children. If you are a minor, please use this site with the awareness and guidance of a parent or guardian."],
  ["Changes", "This policy may be updated as the site changes. Continued use of the site after changes means you accept the updated policy."],
  ["Contact", "Questions about this policy, or requests about your data, can be sent to joobler9@gmail.com."],
];

export default function PrivacyPage() {
  return <LegalPageLayout title="Privacy Policy" sections={SECTIONS} />;
}
