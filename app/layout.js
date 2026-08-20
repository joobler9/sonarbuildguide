import "./globals.css";
import { AuthProvider } from "@/lib/useAuth";

// Forces every page on the site to render fresh on every single request,
// never as a static prebuilt shell. Static pages get served straight from
// Vercel's CDN, which sits outside the app's own cache-control headers,
// so without this, a cached static shell could be served even when the
// underlying data has genuinely changed.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = {
  title: "Joobs Build Guides",
  description: "Unofficial fan tool for Creatures of Sonaria builds, traits, and plushies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0A0B10", color: "#F5F5F7", fontFamily: "sans-serif" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
