import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { siteOrigin, indexingEnabled } from "@/lib/seo";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: "Zipora — A clearer picture of place",
    template: "%s | Zipora",
  },
  description:
    "Explore U.S. ZIP-area statistics with transparent Census sources.",
  robots: { index: indexingEnabled(), follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
