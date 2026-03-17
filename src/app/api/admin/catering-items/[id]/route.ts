import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

    try {
        const updated = await prisma.cateringItem.update({
            where: { id },
            data: {
                name: body.name,
                category: body.category,
                description: body.description,
                priceKind: body.priceKind,
                amount: body.amount !== undefined ? Number(body.amount) : undefined,
                minPeople: body.minPeople !== undefined ? Number(body.minPeople) : undefined,
                unit: body.unit !== undefined ? String(body.unit) : undefined,
                halfPrice: body.halfPrice !== undefined ? Number(body.halfPrice) : undefined,
                fullPrice: body.fullPrice !== undefined ? Number(body.fullPrice) : undefined,
                isVeg: body.isVeg !== undefined ? !!body.isVeg : undefined,
                isSpicy: body.isSpicy !== undefined ? !!body.isSpicy : undefined,
                isPopular: body.isPopular !== undefined ? !!body.isPopular : undefined,
                isAvailable: body.isAvailable !== undefined ? !!body.isAvailable : undefined,
                sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
            },
        });
        return NextResponse.json({ ok: true, item: updated });
    } catch (err) {
        console.error("PATCH Error:", err);
        return NextResponse.json({ ok: false, error: "Failed to update item" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await prisma.cateringItem.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("DELETE Error:", err);
        return NextResponse.json({ ok: false, error: "Failed to delete item" }, { status: 500 });
    }
}
