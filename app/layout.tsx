import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://edgetap.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "EdgeTap — One Tap. Infinite Possibilities.",
    template: "%s · EdgeTap",
  },
  description:
    "Smart NFC experiences for people and businesses. Tap a physical EdgeTap card and open a digital profile, menu, review, or website instantly — no app required.",
  keywords: [
    "NFC",
    "digital business card",
    "smart card",
    "contactless",
    "digital profile",
    "NFC business card",
    "tap to review",
    "QR code",
    "digital menu",
  ],
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "EdgeTap",
    title: "EdgeTap — One Tap. Infinite Possibilities.",
    description:
      "Smart NFC experiences for people and businesses. One tap. Infinite possibilities.",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@edgetap",
    title: "EdgeTap — One Tap. Infinite Possibilities.",
    description:
      "Smart NFC experiences for people and businesses. One tap. Infinite possibilities.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${inter.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[--color-bg] text-[--color-fg] font-sans">
        {children}
      </body>
    </html>
  );
}
