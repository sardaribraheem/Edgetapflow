import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";
import { APP_URL } from "@/lib/site";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "EdgeTap — One Tap. Infinite Possibilities.",
    template: "%s · EdgeTap",
  },
  description:
    "Physical NFC business cards with a QR fallback and an editable digital profile. Rs. 999 per card plus delivery. One tap. Infinite possibilities.",
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
    images: [{ url: "/social-card.png", width: 1200, height: 630, alt: "EdgeTap — One tap. Infinite possibilities." }],
    url: APP_URL,
    siteName: "EdgeTap",
    title: "EdgeTap — One Tap. Infinite Possibilities.",
    description:
      "Smart NFC experiences for people and businesses. One tap. Infinite possibilities.",
  },
  icons: { icon: "/brand-icon.svg", apple: "/apple-touch-icon.png" },
  twitter: {
    card: "summary_large_image",
    images: ["/social-card.png"],
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
