import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function bad(msg: string, status = 400) {
    return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const body = await req.json().catch(() => null);
    if (!body) return bad("Invalid JSON body");

    const data: Record<string, string | number | boolean | null> = {};

    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.category !== undefined) data.category = String(body.category).trim();
    if (body.description !== undefined) data.description = String(body.description).trim();
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;

    if (body.price !== undefined) {
        const price = Number(body.price);
        if (!Number.isFinite(price) || price < 0) return bad("Price must be a number >= 0");
        data.priceCents = Math.round(price * 100);
    }

    if (body.isVeg !== undefined) data.isVeg = !!body.isVeg;
    if (body.isNonVeg !== undefined) data.isNonVeg = !!body.isNonVeg;
    if (body.isSpicy !== undefined) data.isSpicy = !!body.isSpicy;
    if (body.isPopular !== undefined) data.isPopular = !!body.isPopular;
    if (body.isAvailable !== undefined) data.isAvailable = !!body.isAvailable;
    if (body.inPos !== undefined) data.inPos = !!body.inPos;
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);

    try {
        const updated = await prisma.menuItem.update({
            where: { id },
            data,
        });

        revalidatePath("/admin/menu-items");
        revalidatePath("/menu");

        return NextResponse.json({ ok: true, item: updated });
    } catch (err) {
        if (err instanceof Error && 'code' in err && err.code === "P2025") {
            return bad("Menu item not found", 404);
        }
        console.error("PATCH Error:", err);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        await prisma.menuItem.delete({ where: { id } });

        revalidatePath("/admin/menu-items");
        revalidatePath("/menu");

        return NextResponse.json({ ok: true });
    } catch (err) {
        if (err instanceof Error && 'code' in err && err.code === "P2025") {
            return bad("Menu item not found", 404);
        }
        console.error("DELETE Error:", err);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}
