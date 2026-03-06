import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.itemIds)) {
        return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { itemIds } = body;

    try {
        // Run updates sequentially to avoid transaction deadlocks on SQLite if they happened to switch to it,
        // or just to keep it simple. Prisma `updateMany` can't update different rows with different values easily.
        await prisma.$transaction(
            itemIds.map((id: string, index: number) =>
                prisma.menuItem.update({
                    where: { id },
                    data: { sortOrder: index },
                })
            )
        );

        revalidatePath("/menu");
        revalidatePath("/");
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("Reorder Error:", err);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}
