import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, getAdminCookieName } from "@/lib/adminAuth";

function requireAdmin(req: Request) {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(new RegExp(`${getAdminCookieName()}=([^;]+)`));
    if (!match?.[1]) throw new Error("Unauthorized");
    verifyAdminToken(match[1]);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        requireAdmin(req);
        const body = await req.json();

        const item = await prisma.menuItem.update({
            where: { id: params.id },
            data: {
                name: body.name,
                description: body.description || null,
                priceCents: Number(body.priceCents),
                imageUrl: body.imageUrl || null,
                category: body.category,
                tags: Array.isArray(body.tags) ? body.tags : [],
                isAvailable: body.isAvailable ?? true,
            },
        });

        return NextResponse.json({ item });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        const status = e?.message === "Unauthorized" ? 401 : 400;
        return NextResponse.json({ error: e?.message || "Failed" }, { status });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        requireAdmin(req);
        await prisma.menuItem.delete({ where: { id: params.id } });
        return NextResponse.json({ ok: true });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        const status = e?.message === "Unauthorized" ? 401 : 400;
        return NextResponse.json({ error: e?.message || "Failed" }, { status });
    }
}
