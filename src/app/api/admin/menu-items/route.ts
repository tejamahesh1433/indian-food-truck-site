import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function bad(msg: string, status = 400) {
    return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") ?? "").trim();
    const category = searchParams.get("category") ?? "All";
    const veg = searchParams.get("veg") === "1";
    const spicy = searchParams.get("spicy") === "1";
    const popular = searchParams.get("popular") === "1";
    const available = searchParams.get("available"); // "1" | "0" | null
    const orderByParam = searchParams.get("orderBy") ?? "sortOrder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = [{ sortOrder: "asc" }, { name: "asc" }];
    if (orderByParam === "priceCents") orderBy = [{ priceCents: "asc" }];
    else if (orderByParam === "name") orderBy = [{ name: "asc" }];
    else if (orderByParam === "updatedAt") orderBy = [{ updatedAt: "desc" }];
    else if (orderByParam === "sortOrder") orderBy = [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }];

    try {
        const items = await prisma.menuItem.findMany({
            where: {
                ...(q
                    ? {
                        OR: [
                            { name: { contains: q, mode: "insensitive" } },
                            { description: { contains: q, mode: "insensitive" } },
                        ],
                    }
                    : {}),
                ...(category !== "All" ? { category } : {}),
                ...(veg ? { isVeg: true } : {}),
                ...(spicy ? { isSpicy: true } : {}),
                ...(popular ? { isPopular: true } : {}),
                ...(available === "1" ? { isAvailable: true } : {}),
                ...(available === "0" ? { isAvailable: false } : {}),
            },
            orderBy,
        });

        return NextResponse.json({ ok: true, items });
    } catch (err) {
        console.error("API Error:", err);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    if (!body) return bad("Invalid JSON body");

    const name = String(body.name ?? "").trim();
    const category = String(body.category ?? "").trim();
    const price = Number(body.price ?? NaN);
    const description = String(body.description ?? "").trim();
    const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;

    if (!name) return bad("Name is required");
    if (!category) return bad("Category is required");
    if (!Number.isFinite(price) || price < 0) return bad("Price must be a number >= 0");

    const priceCents = Math.round(price * 100);

    const last = await prisma.menuItem.findFirst({
        where: { category },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
    });

    const created = await prisma.menuItem.create({
        data: {
            name,
            category,
            description,
            priceCents,
            imageUrl,
            isVeg: !!body.isVeg,
            isSpicy: !!body.isSpicy,
            isPopular: !!body.isPopular,
            isAvailable: body.isAvailable !== false,
            inPos: body.inPos !== false,
            sortOrder: (last?.sortOrder ?? 0) + 1,
        },
    });

    return NextResponse.json({ ok: true, item: created }, { status: 201 });
}
