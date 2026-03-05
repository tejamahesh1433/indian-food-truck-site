import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function bad(msg: string, status = 400) {
    return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function POST(req: Request) {
    // Assuming admin middleware protects this route implicitly in production setup
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.ids) || !body.action) {
        return bad("Invalid payload");
    }

    const { ids, action } = body as {
        ids: string[];
        action: "available" | "unavailable" | "pos_on" | "pos_off" | "delete";
    };

    if (ids.length === 0) return NextResponse.json({ ok: true, count: 0 });

    try {
        let result;

        switch (action) {
            case "available":
                result = await prisma.menuItem.updateMany({
                    where: { id: { in: ids } },
                    data: { isAvailable: true },
                });
                break;
            case "unavailable":
                result = await prisma.menuItem.updateMany({
                    where: { id: { in: ids } },
                    data: { isAvailable: false },
                });
                break;
            case "pos_on":
                result = await prisma.menuItem.updateMany({
                    where: { id: { in: ids } },
                    data: { inPos: true },
                });
                break;
            case "pos_off":
                result = await prisma.menuItem.updateMany({
                    where: { id: { in: ids } },
                    data: { inPos: false },
                });
                break;
            case "delete":
                result = await prisma.menuItem.deleteMany({
                    where: { id: { in: ids } },
                });
                break;
            default:
                return bad("Invalid bulk action");
        }

        return NextResponse.json({ ok: true, count: result.count });
    } catch (err: any) {
        console.error("Bulk action failed:", err);
        return bad("Database operation failed", 500);
    }
}
