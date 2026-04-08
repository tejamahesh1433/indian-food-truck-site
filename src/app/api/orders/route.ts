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
    notes: z.string().optional(),
    items: z.array(z.object({
        id: z.string(),
        menuItemId: z.string(),
        name: z.string(),
        priceCents: z.number().int().positive(),
        quantity: z.number().int().positive(),
        notes: z.string().optional(),
        addons: z.array(z.object({
            id: z.string(),
            name: z.string(),
            priceCents: z.number().int().nonnegative()
        })).optional()
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
        const uniqueItemIds = Array.from(new Set(validatedData.items.map(i => i.menuItemId)));
        const dbItems = await prisma.menuItem.findMany({
            where: { 
                id: { in: uniqueItemIds },
                isAvailable: true 
            }
        });

        if (dbItems.length !== uniqueItemIds.length) {
            return NextResponse.json({ 
                error: "One or more items in your cart are no longer available. Please refresh and try again." 
            }, { status: 400 });
        }

        // Map DB items for easy lookup
        const dbItemMap = new Map(dbItems.map(item => [item.id, item]));

        const addonIds = Array.from(new Set(
            validatedData.items.flatMap(i => i.addons?.map(a => a.id) || [])
        ));
        
        const dbAddons = await prisma.menuAddon.findMany({
            where: {
                id: { in: addonIds },
                isAvailable: true
            }
        });
        const dbAddonMap = new Map(dbAddons.map(a => [a.id, a]));

        // Validate stock
        for (const item of validatedData.items) {
            const dbItem = dbItemMap.get(item.menuItemId);
            if (dbItem && dbItem.isStockTracked) {
                if ((dbItem.stockCount ?? 0) < item.quantity) {
                    return NextResponse.json({
                        error: `Not enough stock for ${dbItem.name}`
                    }, { status: 400 });
                }
            }
        }

        // Calculate total using verified DB prices
        const subtotalAmount = validatedData.items.reduce((acc, item) => {
            const dbItem = dbItemMap.get(item.menuItemId);
            if (!dbItem) return acc;
            
            let itemTotal = dbItem.priceCents;
            if (item.addons) {
                for (const addon of item.addons) {
                    const dbAddon = dbAddonMap.get(addon.id);
                    if (dbAddon && dbAddon.menuItemId === item.menuItemId) {
                        itemTotal += dbAddon.priceCents;
                    }
                }
            }
            return acc + (itemTotal * item.quantity);
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
                notes: validatedData.notes,
                subtotalAmount,
                taxAmount,
                serviceFeeAmount,
                totalAmount,
                status: "PENDING",
                chatToken: crypto.randomUUID(), // Secure tracking token
                userId: (session?.user as { id: string })?.id || null, // Link to user if logged in
                items: {
                    create: validatedData.items.map(item => {
                        const dbItem = dbItemMap.get(item.menuItemId)!;
                        let itemTotal = dbItem.priceCents;
                        if (item.addons) {
                            for (const addon of item.addons) {
                                const dbAddon = dbAddonMap.get(addon.id);
                                if (dbAddon && dbAddon.menuItemId === item.menuItemId) {
                                    itemTotal += dbAddon.priceCents;
                                }
                            }
                        }
                        return {
                            menuItemId: item.menuItemId,
                            name: dbItem.name, 
                            quantity: item.quantity,
                            priceCents: itemTotal,
                            notes: item.notes,
                            addons: item.addons ? item.addons : undefined
                        };
                    })
                }
            }
        });

        // Decrement stock
        await Promise.all(validatedData.items.map(async (item) => {
            const dbItem = dbItemMap.get(item.menuItemId);
            if (dbItem && dbItem.isStockTracked) {
                await prisma.menuItem.update({
                    where: { id: item.menuItemId },
                    data: { stockCount: { decrement: item.quantity } }
                });
            }
        }));

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
