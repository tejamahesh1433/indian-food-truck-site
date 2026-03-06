import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.itemIds)) {
        return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
    }

    try {
        const { itemIds } = body;
        await prisma.$transaction(
            itemIds.map((id: string, index: number) =>
                prisma.cateringItem.update({
                    where: { id },
                    data: { sortOrder: index },
                })
            )
        );
        revalidatePath("/catering");
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("Reorder Error:", err);
        return NextResponse.json({ ok: false, error: "Failed to reorder items" }, { status: 500 });
    }
}
