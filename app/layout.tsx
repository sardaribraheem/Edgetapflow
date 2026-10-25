import PricingProvider from '@/components/PricingProvider';
import type { Metadata, Viewport } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";
import { APP_URL } from "@/lib/site";
import { SITE_DESCRIPTION, SOCIAL_IMAGE } from "@/lib/seo";

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "variable",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "EdgeTap · NFC Business Cards in Lahore, Pakistan",
    template: "%s · EdgeTap",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    images: [SOCIAL_IMAGE],
    url: APP_URL,
    siteName: "EdgeTap",
    title: "EdgeTap · NFC Business Cards in Lahore, Pakistan",
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: `${APP_URL}/favicon-96.png`, type: "image/png", sizes: "96x96" },
      { url: `${APP_URL}/favicon-512.png`, type: "image/png", sizes: "512x512" },
      { url: `${APP_URL}/favicon.ico`, type: "image/x-icon", sizes: "16x16 32x32 48x48 96x96 256x256" },
    ],
    shortcut: `${APP_URL}/favicon.ico`,
    apple: { url: `${APP_URL}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
  },
  twitter: {
    card: "summary_large_image",
    images: [SOCIAL_IMAGE.url],
    title: "EdgeTap · NFC Business Cards in Lahore, Pakistan",
    description: SITE_DESCRIPTION,
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
      data-scroll-behavior="smooth"
      className={`${fredoka.variable} ${inter.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)] font-sans">
        <PricingProvider>{children}</PricingProvider>
      </body>
    </html>
  );
}
