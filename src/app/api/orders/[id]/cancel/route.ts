import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const orderId = params.id;

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;

        // Fetch the order and verify ownership
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.userId !== userId) {
            return NextResponse.json({ error: "Forbidden: You do not own this order" }, { status: 403 });
        }

        // Verify if order is within the 15-second cancellation window
        const fifteenSecondsAgo = new Date(Date.now() - 15000);
        if (order.createdAt < fifteenSecondsAgo) {
            return NextResponse.json({ 
                error: "Cancellation window has closed. Orders can only be cancelled within 15 seconds of placement." 
            }, { status: 400 });
        }

        // If order was PAID, initiate a Stripe refund
        if (order.status === "PAID" && order.stripeSessionId) {
            try {
                // In this system, stripeSessionId stores the PaymentIntent ID for simple retrieval
                await stripe.refunds.create({
                    payment_intent: order.stripeSessionId,
                });
                console.log(`✅ Stripe Refund initiated for Order ${orderId}`);
            } catch (stripeError) {
                console.error("❌ Stripe Refund Error:", stripeError);
                return NextResponse.json({ 
                    error: "Failed to process refund with Stripe. Please contact support." 
                }, { status: 500 });
            }
        }

        // Update Order Status to CANCELLED
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Order has been successfully cancelled and a refund has been initiated if applicable.",
            order: updatedOrder 
        });

    } catch (error) {
        console.error("ORDER_CANCEL_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
