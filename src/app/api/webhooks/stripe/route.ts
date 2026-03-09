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
    } catch (err: any) {
        console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
        const sessionOrIntent = event.data.object as any;
        const orderId = sessionOrIntent.metadata?.orderId;

        console.log(`📦 Processing ${event.type}: ${sessionOrIntent.id} for Order: ${orderId}`);

        if (orderId) {
            try {
                const updatedOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: { status: "PAID" }
                });
                console.log(`✅ Order ${orderId} successfully marked as PAID in database.`);
            } catch (dbError: any) {
                console.error(`❌ Failed to update order ${orderId} in database:`, dbError.message);
            }
        } else {
            console.warn(`⚠️ No orderId found in ${event.type} metadata. Skipping DB update.`);
        }
    }

    return NextResponse.json({ received: true });
}
