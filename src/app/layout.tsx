import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { SiteProvider } from "@/components/SiteProvider";
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
        <SiteProvider settings={settings}>
          {children}
          <Footer />
          <Analytics />
        </SiteProvider>
      </body>
    </html>
  );
}
