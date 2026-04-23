import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Count orders that are currently being worked on
        const activeOrdersCount = await prisma.order.count({
            where: {
                status: {
                    in: ["PAID", "PENDING", "PREPARING"]
                }
            }
        });

        // Simple estimation logic
        // Base time: 8-12 mins
        // Each active order adds ~3-5 mins
        const minBase = 10;
        const maxBase = 15;
        const perOrder = 4;

        const estimatedMin = minBase + (activeOrdersCount * perOrder);
        const estimatedMax = maxBase + (activeOrdersCount * perOrder);

        return NextResponse.json({
            count: activeOrdersCount,
            estimatedMin,
            estimatedMax,
            displayTime: `${estimatedMin}-${estimatedMax} mins`
        });
    } catch (error) {
        console.error("Error calculating wait time:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
