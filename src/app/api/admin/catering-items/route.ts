import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

    let orderBy: any = [{ sortOrder: "asc" }, { name: "asc" }];
    if (orderByParam === "name") orderBy = [{ name: "asc" }];
    else if (orderByParam === "updatedAt") orderBy = [{ updatedAt: "desc" }];
    else if (orderByParam === "sortOrder") orderBy = [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }];

    try {
        const items = await prisma.cateringItem.findMany({
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
    } catch (err: any) {
        console.error("API Error:", err);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    if (!body) return bad("Invalid JSON body");

    const name = String(body.name ?? "").trim();
    const category = String(body.category ?? "").trim();
    const priceKind = String(body.priceKind ?? "").trim(); // PER_PERSON, TRAY, FIXED
    const description = String(body.description ?? "").trim();

    if (!name) return bad("Name is required");
    if (!category) return bad("Category is required");
    if (!priceKind) return bad("PriceKind is required");

    const last = await prisma.cateringItem.findFirst({
        where: { category },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
    });

    const created = await prisma.cateringItem.create({
        data: {
            name,
            category,
            description,
            priceKind,
            amount: body.amount ? Number(body.amount) : null,
            minPeople: body.minPeople ? Number(body.minPeople) : null,
            unit: body.unit ? String(body.unit).trim() : null,
            halfPrice: body.halfPrice ? Number(body.halfPrice) : null,
            fullPrice: body.fullPrice ? Number(body.fullPrice) : null,
            isVeg: !!body.isVeg,
            isSpicy: !!body.isSpicy,
            isPopular: !!body.isPopular,
            isAvailable: body.isAvailable !== false,
            sortOrder: (last?.sortOrder ?? 0) + 1,
        },
    });

    revalidatePath("/catering");
    return NextResponse.json({ ok: true, item: created }, { status: 201 });
}
