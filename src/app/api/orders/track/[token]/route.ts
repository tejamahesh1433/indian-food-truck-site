import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getClientIp, normalizeIp } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// 30 requests per 60-second window per IP
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; retryAfterSecs: number }> {
    const now = new Date();
    const key = `track_${ip}`;

    // Async cleanup of expired records (fire-and-forget)
    prisma.adminLoginAttempt.deleteMany({
        where: { ip: key, expiresAt: { lt: now } },
    }).catch(() => {});

    const record = await prisma.adminLoginAttempt.findFirst({
        where: { ip: key, expiresAt: { gt: now } },
    });

    if (!record) {
        await prisma.adminLoginAttempt.create({
            data: {
                ip: key,
                count: 1,
                expiresAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS),
            },
        });
        return { allowed: true, retryAfterSecs: 0 };
    }

    if (record.count >= RATE_LIMIT_MAX) {
        const retryAfterSecs = Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000);
        return { allowed: false, retryAfterSecs };
    }

    await prisma.adminLoginAttempt.update({
        where: { id: record.id },
        data: { count: record.count + 1 },
    });
    return { allowed: true, retryAfterSecs: 0 };
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const ip = normalizeIp(getClientIp(req));
    const { allowed, retryAfterSecs } = await checkRateLimit(ip);

    if (!allowed) {
        return NextResponse.json(
            { error: "Too many requests. Please slow down." },
            { status: 429, headers: { "Retry-After": String(retryAfterSecs) } },
        );
    }

    const { token } = await params;

    try {
        const order = await prisma.order.findFirst({
            where: { chatToken: token },
            include: {
                items: true,
                reviews: true,
                messages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error("TRACKING_API_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
