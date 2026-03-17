import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.cateringCategory.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return NextResponse.json({ ok: true, categories });
    } catch {
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    if (!body || !body.name) {
        return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
    }

    try {
        const last = await prisma.cateringCategory.findFirst({
            orderBy: { sortOrder: "desc" },
        });
        const created = await prisma.cateringCategory.create({
            data: {
                name: body.name,
                subtitle: body.subtitle,
                sortOrder: (last?.sortOrder ?? 0) + 1,
            },
        });
        return NextResponse.json({ ok: true, category: created });
    } catch {
        return NextResponse.json({ ok: false, error: "Failed to create category" }, { status: 500 });
    }
}
