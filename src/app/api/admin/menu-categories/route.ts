import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.menuCategory.findMany({
            orderBy: { sortOrder: "asc" },
        });

        // Ensure defaults exist if DB is totally empty
        if (categories.length === 0) {
            const defaults = ["Starters", "Mains", "Wraps", "Drinks", "Dessert"];
            await prisma.menuCategory.createMany({
                data: defaults.map((name, i) => ({ name, sortOrder: i + 1 })),
                skipDuplicates: true,
            });

            const fresh = await prisma.menuCategory.findMany({ orderBy: { sortOrder: "asc" } });
            return NextResponse.json({ ok: true, categories: fresh });
        }

        return NextResponse.json({ ok: true, categories });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    if (!body || !body.name) return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });

    try {
        const last = await prisma.menuCategory.findFirst({
            orderBy: { sortOrder: "desc" },
            select: { sortOrder: true },
        });

        const cat = await prisma.menuCategory.create({
            data: {
                name: body.name.trim(),
                sortOrder: (last?.sortOrder ?? 0) + 1,
            },
        });

        return NextResponse.json({ ok: true, category: cat }, { status: 201 });
    } catch (e: any) {
        // Handle unique constraint failure
        if (e.code === 'P2002') {
            return NextResponse.json({ ok: false, error: "Category already exists" }, { status: 400 });
        }
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}
