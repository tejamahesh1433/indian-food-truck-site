import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, getAdminCookieName } from "@/lib/adminAuth";

function requireAdmin(req: Request) {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(new RegExp(`${getAdminCookieName()}=([^;]+)`));
    if (!match?.[1]) throw new Error("Unauthorized");
    verifyAdminToken(match[1]);
}

export async function GET(req: Request) {
    try {
        requireAdmin(req);
        const items = await prisma.menuItem.findMany({ orderBy: { createdAt: "desc" } });
        return NextResponse.json({ items });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function POST(req: Request) {
    try {
        requireAdmin(req);
        const body = await req.json();

        const item = await prisma.menuItem.create({
            data: {
                name: body.name,
                description: body.description || null,
                priceCents: Number(body.priceCents),
                imageUrl: body.imageUrl || null,
                category: body.category,
                isVeg: body.isVeg || false,
                isSpicy: body.isSpicy || false,
                isPopular: body.isPopular || false,
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
