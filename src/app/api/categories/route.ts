import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.menuCategory.findMany({
            orderBy: { sortOrder: "asc" },
        });

        return NextResponse.json({ categories: categories.map(c => c.name) });
    } catch (err) {
        console.error("Failed to fetch categories", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
