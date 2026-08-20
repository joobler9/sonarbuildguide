import Link from "next/link";

export default function LegalPageLayout({ title, sections }) {
  return (
    <div className="page-wrap">
      <div className="legal-page-card">
        <Link href="/" className="legal-close-btn" aria-label="Close">✕</Link>
        <h1 className="site-title" style={{ marginBottom: 4 }}>{title}</h1>
        <p className="notes-text" style={{ marginTop: 0, marginBottom: 20 }}>Last updated: 11/08/2026</p>
        {sections.map(([heading, text], i) => (
          <div key={i} className="legal-section">
            <div className="legal-heading">{heading}</div>
            <p className="legal-text">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
