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
  title: "FridgeAI — Cook What You Have",
  description: "Tell us what's in your fridge. We'll tell you what to cook.",
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
