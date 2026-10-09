import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { configuredSiteOrigin, indexingEnabled } from "@/lib/seo";
import "./globals.css";
const configuredOrigin = configuredSiteOrigin();
export const metadata: Metadata = {
  metadataBase: configuredOrigin ? new URL(configuredOrigin) : undefined,
  title: {
    default: "OKELOM — A clearer picture of place",
    template: "%s | OKELOM",
  },
  description:
    "Explore U.S. ZIP-area statistics with transparent Census sources.",
  robots: { index: indexingEnabled(), follow: indexingEnabled() },
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
