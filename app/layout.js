import { AuthProvider } from "@/lib/useAuth";

export const metadata = {
  title: "Sonaria Build Guide",
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
