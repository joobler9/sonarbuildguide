import LegalPageLayout from "@/components/LegalPageLayout";

const SECTIONS = [
  ["Acceptance", "By using this site, you agree to these terms. If you don't agree, please don't use the site."],
  ["Eligibility", "This site is not intended for children under 13, or the minimum age of digital consent in your country if that's higher. By using this site, you're confirming you meet that age requirement, and if you're a minor above that age but below the age of majority where you live, that a parent or guardian is aware of and okay with your use of the site."],
  ["Not an official product", "This is an unofficial fan project, not affiliated with the developers of Creatures of Sonaria. See the Disclaimer page for details."],
  ["Account responsibility", "You're responsible for keeping your password secure and for anything that happens under your account. Let us know at joobler9@gmail.com if you think your account has been compromised."],
  ["User conduct", "You agree not to use this site to harass, threaten, or intimidate other users; post spam, illegal content, or content that infringes someone else's rights; impersonate another person; attempt to gain unauthorized access to any part of the site; or otherwise interfere with the site's normal operation, including through bots, scrapers, or automated tools not intended for regular use."],
  ["Child safety", "This site has zero tolerance for any content or behavior that sexually exploits, endangers, or abuses minors, including child sexual abuse material, grooming, or sextortion, in any form. Anyone who violates this will be permanently barred from the site. If you encounter this kind of content or behavior here, please report it immediately to joobler9@gmail.com so it can be addressed. We won't retaliate against anyone reporting this in good faith."],
  ["Content ownership", "Creatures of Sonaria and all related game content belong to their own creators, not to this site or its users. You retain ownership of the comments you personally write here, and by posting them you're allowing the site to display them to other users as part of its normal functioning. Don't post anything you don't actually have the right to share."],
  ["Links to other sites", "This site may link out to other websites we don't own or control, including the official game or its community wiki. We aren't responsible for the content or practices of those sites, and linking to them isn't an endorsement."],
  ["No warranty", "This site is provided as-is, without warranty of any kind. We don't guarantee it will be error-free, always available, or that the information on it is fully accurate."],
  ["Limitation of liability", "To the fullest extent permitted by law, this site and its creator are not liable for any damages, losses, or disputes arising from your use of the site."],
  ["Indemnification", "You agree to cover any reasonable costs, including legal fees, that arise from a claim against us caused by your misuse of the site or your violation of these terms."],
  ["If part of this doesn't hold up", "If any part of these terms turns out to be unenforceable, the rest of them still apply. Us not enforcing a rule one time doesn't mean we're giving up the right to enforce it later."],
  ["Governing law", "These terms are governed by the laws of Australia. If you're using this site from outside Australia, you're responsible for following the laws that apply to you locally too."],
  ["Changes", "These terms may be updated over time. Continued use of the site after changes means you accept the updated terms."],
  ["Contact", "Questions about these terms can be sent to joobler9@gmail.com."],
];

export default function TermsPage() {
  return <LegalPageLayout title="Terms of Service" sections={SECTIONS} />;
}
