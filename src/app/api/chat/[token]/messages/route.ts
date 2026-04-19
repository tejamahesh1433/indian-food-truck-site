import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function bad(msg: string, status = 400) {
    return NextResponse.json({ error: msg }, { status });
}

const MAX_LEN = 1000;

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    const reqRow = await prisma.cateringRequest.findUnique({
        where: { chatToken: token },
        select: { id: true, chatEnabled: true },
    });

    if (!reqRow || !reqRow.chatEnabled) return bad("Not found", 404);

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const messages = await prisma.cateringMessage.findMany({
        where: { 
            requestId: reqRow.id,
            createdAt: { gte: fortyEightHoursAgo }
        },
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
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    const body = await req.json().catch(() => null);
    const text = String(body?.text ?? "").trim();

    if (!text) return bad("Message is empty");
    if (text.length > MAX_LEN) return bad("Message too long");

    const reqRow = await prisma.cateringRequest.findUnique({
        where: { chatToken: token },
        select: { id: true, chatEnabled: true },
    });

    if (!reqRow || !reqRow.chatEnabled) return bad("Not found", 404);

    await prisma.cateringMessage.create({
        data: {
            requestId: reqRow.id,
            sender: "CUSTOMER",
            text,
        },
    });

    return NextResponse.json({ ok: true });
}
