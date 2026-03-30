import { prisma } from "@/lib/prisma";
import AdminLayoutClient from "./AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Fetch business name for the topbar
    let settings = null;
    try {
        settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
    } catch {}

    const businessName = settings?.businessName || "Indian Food Truck";

    return (
        <AdminLayoutClient businessName={businessName}>
            {children}
        </AdminLayoutClient>
    );
}
