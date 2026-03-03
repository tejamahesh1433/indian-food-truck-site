import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const category = url.searchParams.get("category"); // optional

    const items = await prisma.menuItem.findMany({
        where: {
            isAvailable: true,
            ...(category ? { category } : {}),
        },
        orderBy: [{ isPopular: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ items });
}
