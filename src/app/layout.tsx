import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { SiteProvider } from "@/components/SiteProvider";
import CartDrawer from "@/components/CartDrawer";
import { Analytics } from "@vercel/analytics/react";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Indian Food Truck | Hartford, CT",
  description:
    "Authentic Indian street food on wheels in Hartford, CT. View the menu, find today’s location, and book catering.",
  metadataBase: new URL("https://indian-food-truck-site.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Indian Food Truck | Hartford, CT",
    description: "Authentic Indian street food on wheels in Hartford, CT. View the menu, find today’s location, and book catering.",
    url: "/",
    siteName: "Indian Food Truck",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Indian Food Truck - Masala Street Food",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Food Truck | Hartford, CT",
    description: "Authentic Indian street food on wheels in Hartford, CT. View the menu, find today’s location, and book catering.",
    images: ["/og-image.png"],
  },
  // PWA / app icons
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png",   sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png",   sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  // iOS standalone PWA appearance
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Indian Food Truck",
  },
};

import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/components/AuthProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  try {
    settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  } catch { }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <SiteProvider settings={settings}>
              <ServiceWorkerRegistration />
              <AnnouncementBanner />
              {children}
              <CartDrawer />
              <Footer />
              <Analytics />
            </SiteProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
