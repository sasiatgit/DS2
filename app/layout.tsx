import type { Metadata } from "next";
import { business } from "@/lib/config";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";
const description =
  "Practical software development, business automation, QA automation and startup MVP development in Chennai. DS2 turns business problems into reliable technology solutions.";
export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: "DS2 | Software & Business Automation in Chennai",
    template: "%s | DS2",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: business.name,
    title: "Your Business Problem. Our Technology Solution.",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "DS2 — Technology that solves real problems",
    description,
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
