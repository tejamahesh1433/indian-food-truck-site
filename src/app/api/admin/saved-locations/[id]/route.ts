import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.savedLocation.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Delete location error:", error);
        return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
    }
}
