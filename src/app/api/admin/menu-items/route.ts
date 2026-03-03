import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const items = await prisma.menuItem.findMany({
        orderBy: [{ updatedAt: "desc" }],
    });
    return NextResponse.json({ items });
}

export async function POST(req: Request) {
    const body = await req.json();

    const item = await prisma.menuItem.create({
        data: {
            name: body.name,
            description: body.description ?? null,
            priceCents: Number(body.priceCents),
            category: body.category,
            isVeg: !!body.isVeg,
            isSpicy: !!body.isSpicy,
            isPopular: !!body.isPopular,
            isAvailable: body.isAvailable !== false,
            imageUrl: body.imageUrl ?? null,
        },
    });

    return NextResponse.json({ item }, { status: 201 });
}
