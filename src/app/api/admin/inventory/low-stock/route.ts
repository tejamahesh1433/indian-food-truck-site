import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "global" },
            select: { lowStockThreshold: true }
        });

        const threshold = settings?.lowStockThreshold ?? 5;

        const lowStockItems = await prisma.menuItem.findMany({
            where: {
                isStockTracked: true,
                stockCount: {
                    lte: threshold
                },
                isAvailable: true // Only alert for items that are currently active
            },
            select: {
                id: true,
                name: true,
                stockCount: true,
                category: true,
            },
            orderBy: {
                stockCount: "asc"
            }
        });

        return NextResponse.json({
            items: lowStockItems,
            threshold
        });
    } catch (error) {
        console.error("Error fetching low stock items:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
