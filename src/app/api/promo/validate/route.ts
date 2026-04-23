import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { code, subtotal } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        const promoCode = await prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!promoCode || !promoCode.isActive) {
            return NextResponse.json({ error: "Invalid or inactive promo code" }, { status: 404 });
        }

        // Check expiry
        if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
            return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
        }

        // Check usage limits
        if (promoCode.maxUsage && promoCode.currentUsage >= promoCode.maxUsage) {
            return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 });
        }

        // Check minimum order amount
        if (subtotal < promoCode.minOrderAmount) {
            return NextResponse.json({ 
                error: `Minimum subtotal for this code is $${(promoCode.minOrderAmount / 100).toFixed(2)} (excluding tax)` 
            }, { status: 400 });
        }

        return NextResponse.json({
            id: promoCode.id,
            code: promoCode.code,
            discountType: promoCode.discountType,
            discountValue: promoCode.discountValue,
            minOrderAmount: promoCode.minOrderAmount,
            maxDiscountAmount: promoCode.maxDiscountAmount
        });

    } catch (error) {
        console.error("PROMO_VALIDATE_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
