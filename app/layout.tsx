import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Fraunces: our display font
// variable: creates a CSS variable we can reference
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  // weight range — Fraunces is a variable font
  // 'variable' means it supports any weight from 100-900
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: " FridgeAI — Cook What You Have",
    // Shown on the home page and any page without its own title
    template: "%s | FridgeAI",
    // Other pages set title: "Pasta Carbonara"
    // This template renders it as: "Pasta Carbonara | FridgeAI"
    // %s = placeholder for the page's title
  },
  description: "Tell us what's in your fridge. We'll tell you what to cook.",

  // ── Open Graph ────────────────────────────────────────────
  // Open Graph = metadata that controls how links appear when
  // shared on WhatsApp, Discord, Twitter, LinkedIn, Slack.
  // Without OG tags: just a bare URL. With them: rich preview.

  openGraph: {
    title: "FridgeAI-Cook what you Have",
    description: "Turn  your fridge ingredients into delicious recipes ",
    url: "https://fridgeai.vercel.app",
    siteName: "FridgeAI",
    images: [
      {
        url: "/og-image.png",
        // Create a 1200×630px image (the standard OG size).
        // Put it in /public/og-image.png
        // This is the thumbnail that appears when you share the link.
        width: 1200,
        height: 630,
        alt: "FridgeAI — AI-powered recipe suggestions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  //------------------- T2witter Card---------------
  twitter: {
    card: "summary_large_image",
    // summary_large_image = big image preview on Twitter/X
    title: "FridgeAI — Cook What You Have",
    description: "Turn your fridge ingredients into delicious recipes.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${plusJakarta.variable}`}>
        {children}
      </body>
    </html>
  );
}
