import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isWellRecognizedEmail, EMAIL_DOMAIN_ERROR } from "@/lib/validation";

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
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const validatedData = OrderSchema.parse(body);

        if (!isWellRecognizedEmail(validatedData.customerEmail)) {
            return NextResponse.json({ error: EMAIL_DOMAIN_ERROR }, { status: 400 });
        }

        // Fetch actual prices from DB to prevent client-side price tampering
        const itemIds = validatedData.items.map(i => i.id);
        const dbItems = await prisma.menuItem.findMany({
            where: { 
                id: { in: itemIds },
                isAvailable: true 
            }
        });

        if (dbItems.length !== validatedData.items.length) {
            return NextResponse.json({ 
                error: "One or more items in your cart are no longer available. Please refresh and try again." 
            }, { status: 400 });
        }

        // Map DB items for easy lookup
        const dbItemMap = new Map(dbItems.map(item => [item.id, item]));

        // Calculate total using verified DB prices
        const subtotalAmount = validatedData.items.reduce((acc, item) => {
            const dbItem = dbItemMap.get(item.id);
            if (!dbItem) return acc; // Should not happen due to length check
            return acc + (dbItem.priceCents * item.quantity);
        }, 0);

        const taxAmount = Math.round(subtotalAmount * 0.0635); // 6.35% CT Sales Tax
        const serviceFeeAmount = 0;
        const totalAmount = subtotalAmount + taxAmount;

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
                subtotalAmount,
                taxAmount,
                serviceFeeAmount,
                totalAmount,
                status: "PENDING",
                chatToken: crypto.randomUUID(), // Secure tracking token
                userId: (session?.user as { id: string })?.id || null, // Link to user if logged in
                items: {
                    create: validatedData.items.map(item => {
                        const dbItem = dbItemMap.get(item.id)!;
                        return {
                            menuItemId: item.id,
                            name: dbItem.name, // Use DB name too for consistency
                            quantity: item.quantity,
                            priceCents: dbItem.priceCents,
                        };
                    })
                }
            }
        });

        // Create Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId: order.id,
            },
        });

        // Update Order with Stripe PaymentIntent ID
        await prisma.order.update({
            where: { id: order.id },
            data: { stripeSessionId: paymentIntent.id } // Reuse field for PI ID
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            orderId: order.id,
            totalAmount: order.totalAmount,
            subtotalAmount: order.subtotalAmount,
            taxAmount: order.taxAmount,
            serviceFeeAmount: order.serviceFeeAmount,
        });
    } catch (error: unknown) {
        console.error("ORDER_CREATE_ERROR:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }

        // Handle Stripe Errors
        if (error && typeof error === 'object' && 'type' in error && error.type === 'StripeAuthenticationError') {
            return NextResponse.json({
                error: "Payment service temporarily unavailable. Please try again later."
            }, { status: 401 });
        }

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
