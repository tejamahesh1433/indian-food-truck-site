import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const requests = await prisma.cateringRequest.findMany({
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requests });
}

export async function PATCH(req: Request) {
    const { id, status } = await req.json().catch(() => ({ id: "", status: "" }));
    if (!id || !status) return NextResponse.json({ ok: false }, { status: 400 });

    try {
        await prisma.cateringRequest.update({
            where: { id },
            data: { status }
        });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
