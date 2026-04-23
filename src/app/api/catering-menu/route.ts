import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Cache catering menu for 60 seconds

export async function GET() {
    try {
        const categories = await prisma.cateringCategory.findMany({
            orderBy: { sortOrder: "asc" },
        });

        const items = await prisma.cateringItem.findMany({
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" },
        });

        const sections = categories.map((cat) => {
            const seenNames = new Set<string>();
            const filteredItems = items
                .filter((item) => item.category === cat.name)
                .filter((item) => {
                    const normalized = item.name.trim().toLowerCase();
                    if (seenNames.has(normalized)) return false;
                    seenNames.add(normalized);
                    return true;
                });

            return {
                title: cat.name,
                subtitle: cat.subtitle,
                items: filteredItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    badges: [
                        item.isVeg && "VEG",
                        item.isSpicy && "SPICY",
                        item.isPopular && "POPULAR",
                    ].filter(Boolean) as string[],
                    price: (() => {
                        switch (item.priceKind) {
                            case "PER_PERSON":
                                return { kind: "PER_PERSON", amount: item.amount, minPeople: item.minPeople };
                            case "TRAY":
                                return { kind: "TRAY", half: item.halfPrice, full: item.fullPrice };
                            case "FIXED":
                                return { kind: "FIXED", amount: item.amount, unit: item.unit };
                            default:
                                console.error(`Invalid priceKind [${item.priceKind}] for item: ${item.name} (${item.id})`);
                                return { kind: "FIXED", amount: 0, unit: "INVALID_PRICE_KIND" };
                        }
                    })()
                })),
            };
        });

        return NextResponse.json({ ok: true, sections });
    } catch (err) {
        console.error("Fetch Menu Error:", err);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}
