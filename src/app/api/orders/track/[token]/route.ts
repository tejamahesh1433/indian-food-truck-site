import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        const order = await prisma.order.findFirst({
            where: { chatToken: token },
            include: { 
                items: true,
                reviews: true,
                messages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Return sensitive info sparingly (e.g. no full address if we had it, but here it's fine)
        return NextResponse.json(order);
    } catch (error) {
        console.error("TRACKING_API_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
