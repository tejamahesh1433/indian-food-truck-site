import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const specials = await prisma.todaysSpecial.findMany({
            orderBy: { sortOrder: "asc" }
        });
        return NextResponse.json(specials);
    } catch (error) {
        console.error("GET TodaysSpecial Error:", error);
        return NextResponse.json({ error: "Failed to fetch today's specials" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Find last sortOrder
        const last = await prisma.todaysSpecial.findFirst({
            orderBy: { sortOrder: "desc" },
            select: { sortOrder: true }
        });

        const special = await prisma.todaysSpecial.create({
            data: {
                name: body.name,
                description: body.description,
                priceCents: parseInt(body.priceCents),
                imageUrl: body.imageUrl,
                isActive: body.isActive ?? true,
                isVeg: !!body.isVeg,
                isNonVeg: !!body.isNonVeg,
                isSpicy: !!body.isSpicy,
                isPopular: !!body.isPopular,
                sortOrder: (last?.sortOrder ?? 0) + 1
            }
        });
        return NextResponse.json(special);
    } catch (error) {
        console.error("POST TodaysSpecial Error:", error);
        return NextResponse.json({ error: "Failed to create special" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;
        
        const special = await prisma.todaysSpecial.update({
            where: { id },
            data: {
                ...data,
                priceCents: data.priceCents ? parseInt(data.priceCents) : undefined,
                isVeg: data.isVeg !== undefined ? !!data.isVeg : undefined,
                isNonVeg: data.isNonVeg !== undefined ? !!data.isNonVeg : undefined,
                isSpicy: data.isSpicy !== undefined ? !!data.isSpicy : undefined,
                isPopular: data.isPopular !== undefined ? !!data.isPopular : undefined,
            }
        });
        return NextResponse.json(special);
    } catch (error) {
        console.error("PATCH TodaysSpecial Error:", error);
        return NextResponse.json({ error: "Failed to update special" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await prisma.todaysSpecial.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE TodaysSpecial Error:", error);
        return NextResponse.json({ error: "Failed to delete special" }, { status: 500 });
    }
}
