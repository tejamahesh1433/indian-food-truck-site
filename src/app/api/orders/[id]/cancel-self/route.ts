import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { chatToken } = await req.json();

        // Verify customer identity via chat token
        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Verify chat token matches
        if (order.chatToken !== chatToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only allow cancellation if order hasn't been prepared
        if (!["PENDING", "PAID"].includes(order.status)) {
            return NextResponse.json(
                {
                    error: `Cannot cancel order with status ${order.status}. Orders can only be cancelled before preparation starts.`,
                },
                { status: 400 }
            );
        }

        // Cancel the order
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: "CANCELLED",
                updatedAt: new Date(),
            },
        });

        // Add cancellation message to chat
        await prisma.orderMessage.create({
            data: {
                orderId: id,
                sender: "CUSTOMER",
                text: "Customer cancelled this order",
            },
        });

        return NextResponse.json({
            success: true,
            order: {
                id: updatedOrder.id,
                status: updatedOrder.status,
                cancelledAt: updatedOrder.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error cancelling order:", error);
        return NextResponse.json(
            { error: "Failed to cancel order" },
            { status: 500 }
        );
    }
}
