import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, getAdminCookieName } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: orderId } = await params;
    const session = await getServerSession(authOptions);

    const cookieStore = await cookies();
    const adminToken = cookieStore.get(getAdminCookieName())?.value;
    const isAdmin = adminToken ? await verifyAdminToken(adminToken) : false;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { messages: { orderBy: { createdAt: "asc" } } }
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Permission check: Admin or the customer who placed the order
    if (!isAdmin && order.customerEmail !== session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(order.messages);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: orderId } = await params;
    const { text } = await req.json();

    if (!text || text.trim() === "") {
        return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const adminToken = cookieStore.get(getAdminCookieName())?.value;
    const isAdmin = adminToken ? await verifyAdminToken(adminToken) : false;

    const order = await prisma.order.findUnique({
        where: { id: orderId }
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Determine sender based on both credentials and page context
    // This allows developers to test both roles in the same browser without cookie conflicts.
    const referer = req.headers.get("referer") || "";
    const isFromAdminPage = referer.includes("/admin");

    let sender: "ADMIN" | "CUSTOMER" | null = null;

    if (isAdmin && isFromAdminPage) {
        sender = "ADMIN";
    } else if (session?.user?.email === order.customerEmail) {
        sender = "CUSTOMER";
    }

    if (!sender) {
        // Fallback for direct API calls or ambiguous states
        if (isAdmin) sender = "ADMIN";
        else return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = await prisma.orderMessage.create({
        data: {
            orderId,
            text: text.trim(),
            sender
        }
    });

    return NextResponse.json(message);
}
