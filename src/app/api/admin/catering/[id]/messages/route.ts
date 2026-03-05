import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function bad(msg: string, status = 400) {
    return NextResponse.json({ error: msg }, { status });
}

// TODO: Replace with your actual admin auth check
function assertAdmin() {
    return true; // We enforce admin via middleware on the route level, or verify cookie here
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!assertAdmin()) return bad("Unauthorized", 401);

    const { id } = await params;

    const messages = await prisma.cateringMessage.findMany({
        where: { requestId: id },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
        messages: messages.map((m) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            createdAt: m.createdAt.toISOString(),
        })),
    });
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!assertAdmin()) return bad("Unauthorized", 401);

    const { id } = await params;

    const body = await req.json().catch(() => null);
    const text = String(body?.text ?? "").trim();
    if (!text) return bad("Message is empty");
    if (text.length > 1000) return bad("Message too long");

    // Ensure request exists
    const exists = await prisma.cateringRequest.findUnique({
        where: { id },
        select: { id: true, chatEnabled: true },
    });
    if (!exists || !exists.chatEnabled) return bad("Not found", 404);

    await prisma.cateringMessage.create({
        data: {
            requestId: id,
            sender: "ADMIN",
            text,
        },
    });

    return NextResponse.json({ ok: true });
}
