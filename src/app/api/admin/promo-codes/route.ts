import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";

export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const promoCodes = await prisma.promoCode.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(promoCodes);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, maxUsage, expiresAt } = body;

        if (!code || !discountType || !discountValue) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (Number(discountValue) <= 0) {
            return NextResponse.json({ error: "Discount value must be positive" }, { status: 400 });
        }

        if (maxUsage !== null && Number(maxUsage) <= 0) {
            return NextResponse.json({ error: "Max uses must be at least 1" }, { status: 400 });
        }

        const promoCode = await prisma.promoCode.create({
            data: {
                code: code.toUpperCase(),
                description,
                discountType,
                discountValue,
                minOrderAmount: minOrderAmount || 0,
                maxDiscountAmount: maxDiscountAmount || null,
                maxUsage: maxUsage || null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            }
        });

        return NextResponse.json(promoCode);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Promo code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
