import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Cache the menu for 60 seconds

export async function GET(req: Request) {
    const url = new URL(req.url);
    const category = url.searchParams.get("category"); // optional

    try {
        // Fetch all items
        const items = await prisma.menuItem.findMany({
            where: {
                isAvailable: true,
                ...(category ? { category } : {}),
            },
            include: {
                addons: {
                    where: { isAvailable: true }
                },
                reviews: {
                    where: { isApproved: true, text: { not: "" } },
                    take: 1,
                    select: { text: true }
                }
            },
            orderBy: [{ isPopular: "desc" }, { name: "asc" }],
        });

        // Fetch aggregate ratings separately to avoid brittle relation naming issues
        const aggregations = await prisma.review.groupBy({
            by: ['menuItemId'],
            where: { 
                isApproved: true,
                menuItemId: { not: null }
            },
            _avg: { rating: true },
            _count: { rating: true }
        });

        // Create a lookup map for the ratings
        const statsMap = new Map(aggregations.map(a => [a.menuItemId, {
            avg: a._avg.rating || 0,
            count: a._count.rating || 0
        }]));

        const itemsWithRatings = items.map(item => {
            const stats = statsMap.get(item.id) || { avg: 0, count: 0 };
            return {
                ...item,
                avgRating: Number(stats.avg.toFixed(1)),
                reviewCount: stats.count
            };
        });

        console.log(`[MENU_API] Found ${items.length} items, ${aggregations.length} items have ratings.`);
        return NextResponse.json({ items: itemsWithRatings });
    } catch (error: unknown) {
        console.error("[MENU_API_ERROR]", error);
        // Fallback to basic list if aggregation fails
        const items = await prisma.menuItem.findMany({
            where: {
                isAvailable: true,
                ...(category ? { category } : {}),
            },
            include: {
                addons: {
                    where: { isAvailable: true }
                }
            },
            orderBy: [{ isPopular: "desc" }, { name: "asc" }],
        });
        return NextResponse.json({ items });
    }
}
