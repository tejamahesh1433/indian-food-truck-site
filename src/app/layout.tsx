import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { SiteProvider } from "@/components/SiteProvider";
import CartDrawer from "@/components/CartDrawer";
import FloatingCart from "@/components/FloatingCart";
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
  title: "Catch the Cravings | Hartford, CT",
  description:
    "Authentic Indian street food on wheels in Hartford, CT. View the menu, find today’s location, and book catering.",
  metadataBase: new URL("https://tejainfo.xyz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Catch the Cravings | Hartford, CT",
    description: "Authentic Indian street food on wheels in Hartford, CT. View the menu, find today’s location, and book catering.",
    url: "/",
    siteName: "Catch the Cravings",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Catch the Cravings - Masala Street Food",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Catch the Cravings | Hartford, CT",
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
    title: "Catch the Cravings",
  },
};

import { CartProvider } from "@/lib/cart";
import { CartAnimationProvider } from "@/lib/cartAnimation";
import { AuthProvider } from "@/components/AuthProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SupportChatWidgetWrapper from "@/components/SupportChatWidgetWrapper";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { ToastProvider } from "@/components/ui/Toast";
import HideOnAdmin from "@/components/HideOnAdmin";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  try {
    settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  } catch { }

  const businessName = settings?.businessName || "Catch the Cravings";
  const cityState    = settings?.cityState    || "Hartford, CT";
  const phone        = settings?.phone        || "";
  const baseUrl      = process.env.NEXT_PUBLIC_BASE_URL || "https://tejainfo.xyz";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: businessName,
    description: `Authentic Indian street food on wheels in ${cityState}. View the menu, find today's location, and book catering.`,
    url: baseUrl,
    telephone: phone,
    servesCuisine: "Indian",
    priceRange: "$$",
    image: `${baseUrl}/og-image.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityState.split(",")[0]?.trim() || "Hartford",
      addressRegion:   cityState.split(",")[1]?.trim() || "CT",
      addressCountry:  "US",
    },
    hasMenu: `${baseUrl}/menu`,
    potentialAction: {
      "@type": "OrderAction",
      target: `${baseUrl}/menu`,
    },
    sameAs: settings?.instagramUrl ? [settings.instagramUrl] : [],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <CartAnimationProvider>
            <SiteProvider settings={settings}>
              <ConfirmProvider>
                <ToastProvider>
                  <ServiceWorkerRegistration />
                  <HideOnAdmin>
                    <AnnouncementBanner />
                    <FloatingCart />
                  </HideOnAdmin>
                  {children}
                  <HideOnAdmin>
                    <CartDrawer />
                    <Footer />
                    <SupportChatWidgetWrapper />
                  </HideOnAdmin>
                  <Analytics />
                </ToastProvider>
              </ConfirmProvider>
            </SiteProvider>
            </CartAnimationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
