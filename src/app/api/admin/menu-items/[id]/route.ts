import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;
    const body = await req.json();

    const item = await prisma.menuItem.update({
        where: { id },
        data: {
            name: body.name,
            description: body.description ?? null,
            priceCents: Number(body.priceCents),
            category: body.category,
            isVeg: !!body.isVeg,
            isSpicy: !!body.isSpicy,
            isPopular: !!body.isPopular,
            isAvailable: !!body.isAvailable,
            imageUrl: body.imageUrl ?? null,
        },
    });

    return NextResponse.json({ item });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;
    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}
