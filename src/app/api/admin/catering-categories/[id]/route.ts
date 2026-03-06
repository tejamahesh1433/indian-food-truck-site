import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

    try {
        const updated = await prisma.cateringCategory.update({
            where: { id },
            data: {
                name: body.name,
                subtitle: body.subtitle,
                sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
            },
        });
        return NextResponse.json({ ok: true, category: updated });
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await prisma.cateringCategory.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: "Failed to delete category" }, { status: 500 });
    }
}
