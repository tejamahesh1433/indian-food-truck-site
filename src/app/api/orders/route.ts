import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const OrderSchema = z.object({
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    customerPhone: z.string().min(10),
    items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        priceCents: z.number().int().positive(),
        quantity: z.number().int().positive(),
    })).min(1),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = OrderSchema.parse(body);

        // Calculate total and verify prices if needed (in a real app, fetch from DB)
        const totalAmount = validatedData.items.reduce((acc, item) => acc + (item.priceCents * item.quantity), 0);

        // Idempotency Check: Prevent duplicate orders within 10 seconds
        const tenSecondsAgo = new Date(Date.now() - 10000);
        const existingOrder = await prisma.order.findFirst({
            where: {
                customerEmail: validatedData.customerEmail,
                customerPhone: validatedData.customerPhone,
                totalAmount: totalAmount,
                createdAt: {
                    gte: tenSecondsAgo
                },
                status: "PENDING"
            },
            orderBy: { createdAt: 'desc' }
        });

        if (existingOrder) {
            console.log("♻️ Duplicate order detected within 10s, returning existing URL");
            // If we have a session ID, return the URL if possible, or just the existing order info
            // For now, let's just error to the frontend as "Already processing" to be safe
            return NextResponse.json({
                error: "Duplicate order attempt. Please wait a moment.",
                orderId: existingOrder.id
            }, { status: 409 });
        }

        // Create Pending Order
        const order = await prisma.order.create({
            data: {
                customerName: validatedData.customerName,
                customerEmail: validatedData.customerEmail,
                customerPhone: validatedData.customerPhone,
                totalAmount,
                status: "PENDING",
                items: {
                    create: validatedData.items.map(item => ({
                        menuItemId: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        priceCents: item.priceCents,
                    }))
                }
            }
        });

        // Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: validatedData.items.map(item => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.priceCents,
                },
                quantity: item.quantity,
            })),
            mode: "payment",
            success_url: `${req.headers.get("origin")}/order-success?orderId=${order.id}`,
            cancel_url: `${req.headers.get("origin")}/menu`,
            metadata: {
                orderId: order.id,
            },
        });

        // Update Order with Stripe Session ID
        await prisma.order.update({
            where: { id: order.id },
            data: { stripeSessionId: session.id }
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("ORDER_CREATE_ERROR:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }

        // Handle Stripe Errors
        if (error.type === 'StripeAuthenticationError') {
            return NextResponse.json({
                error: "Stripe Authentication Error: Your API keys are either missing or invalid. Please update the STRIPE_SECRET_KEY in your .env file."
            }, { status: 401 });
        }

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
