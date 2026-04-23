import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const unreadSupportCount = await prisma.supportMessage.count({
            where: {
                sender: "CUSTOMER",
                isRead: false
            }
        });

        // Fetch low stock items count
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "global" },
            select: { lowStockThreshold: true }
        });
        const threshold = settings?.lowStockThreshold ?? 5;

        const lowStockCount = await prisma.menuItem.count({
            where: {
                isStockTracked: true,
                stockCount: { lte: threshold },
                isAvailable: true
            }
        });

        return NextResponse.json({
            support: unreadSupportCount,
            lowStock: lowStockCount
        });
    } catch (error) {
        console.error("Error fetching unread counts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
