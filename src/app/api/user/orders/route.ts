import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userOrders = await prisma.order.findMany({
            where: {
                user: {
                    email: session.user.email!
                }
            },
            orderBy: { createdAt: "desc" },
            include: { items: true }
        });

        return NextResponse.json(userOrders);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
