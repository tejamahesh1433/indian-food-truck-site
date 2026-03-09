import type { Metadata } from "next";
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
};

import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/components/AuthProvider";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <SiteProvider settings={settings}>
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
