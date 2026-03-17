import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) {
            console.error("❌ Webhook Error: Missing signature or endpoint secret");
            return NextResponse.json({ error: "Webhook Error: Missing config" }, { status: 400 });
        }
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
        console.log(`✅ Webhook Event Received: ${event.type} [${event.id}]`);
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ Webhook Signature Verification Failed: ${errorMsg}`);
        return NextResponse.json({ error: `Webhook Error: ${errorMsg}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessionOrIntent = event.data.object as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orderId = (sessionOrIntent as any).metadata?.orderId || sessionOrIntent.metadata?.orderId;

        console.log(`📦 Processing ${event.type}: ${sessionOrIntent.id} for Order: ${orderId}`);

        if (orderId) {
            try {
                const updatedOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: { status: "PAID" },
                    include: { items: true }
                });
                console.log(`✅ Order ${orderId} successfully marked as PAID in database.`);

                // Send Confirmation Email
                const { sendOrderConfirmationEmail } = await import("@/lib/mail");
                const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
                const host = headersList.get("host") || "localhost:3000";
                
                await sendOrderConfirmationEmail({
                    email: updatedOrder.customerEmail,
                    name: updatedOrder.customerName,
                    orderId: updatedOrder.id,
                    amount: updatedOrder.totalAmount,
                    items: updatedOrder.items.map(i => ({
                        name: i.name,
                        quantity: i.quantity,
                        priceCents: i.priceCents
                    })),
                    trackingLink: `${protocol}://${host}/track/${updatedOrder.chatToken}`
                });
                
                console.log(`📧 Confirmation email sent for Order: ${orderId}`);
            } catch (dbError) {
                const errorMsg = dbError instanceof Error ? dbError.message : String(dbError);
                console.error(`❌ Fulfillment error for order ${orderId}:`, errorMsg);
            }
        } 
    }

    return NextResponse.json({ received: true });
}
