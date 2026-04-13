import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(getAdminCookieName())?.value;
        
        // Simple security check to ensure only admins can fetch live KDS data
        if (!token || !(await verifyAdminToken(token))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const activeOrders = await prisma.order.findMany({
            where: {
                status: {
                    in: ["PENDING", "PAID", "PREPARING", "READY"]
                }
            },
            orderBy: { createdAt: "asc" }, // Oldest first (left), Newest last (right)
            include: { items: true }
        });

        return NextResponse.json(activeOrders);
    } catch (error) {
        console.error("LIVE_ORDERS_FETCH_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
