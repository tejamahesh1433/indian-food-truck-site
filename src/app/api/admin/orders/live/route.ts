import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        // Simple security check to ensure only admins can fetch live KDS data
        // For simplicity, we just check if a session exists since it's the admin dashboard
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const activeOrders = await prisma.order.findMany({
            where: {
                status: {
                    in: ["PAID", "PREPARING", "READY"]
                }
            },
            orderBy: { createdAt: "desc" },
            include: { items: true }
        });

        return NextResponse.json(activeOrders);
    } catch (error) {
        console.error("LIVE_ORDERS_FETCH_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
