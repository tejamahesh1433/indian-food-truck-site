import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.cateringCategory.findMany({
            orderBy: { sortOrder: "asc" },
        });

        const items = await prisma.cateringItem.findMany({
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" },
        });

        const sections = categories.map((cat: any) => ({
            title: cat.name,
            subtitle: cat.subtitle,
            items: items
                .filter((item: any) => item.category === cat.name)
                .map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    badges: [
                        item.isVeg && "VEG",
                        item.isSpicy && "SPICY",
                        item.isPopular && "POPULAR",
                    ].filter(Boolean) as any[],
                    price:
                        item.priceKind === "PER_PERSON" ? { kind: "PER_PERSON", amount: item.amount, minPeople: item.minPeople } :
                            item.priceKind === "TRAY" ? { kind: "TRAY", half: item.halfPrice, full: item.fullPrice } :
                                { kind: "FIXED", amount: item.amount, unit: item.unit }
                })),
        }));

        return NextResponse.json({ ok: true, sections });
    } catch (err: any) {
        console.error("Fetch Menu Error:", err);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}
