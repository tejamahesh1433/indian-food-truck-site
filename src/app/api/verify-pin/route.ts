import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function applyPersistentRateLimit(ip: string): Promise<boolean> {
    const now = new Date();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    prisma.adminLoginAttempt.deleteMany({
        where: { expiresAt: { lt: now } }
    }).catch(() => {});

    const record = await prisma.adminLoginAttempt.findFirst({
        where: { 
            ip: `pin_${ip}`, // Separate prefix for PIN limit
            expiresAt: { gt: now }
        }
    });

    if (!record) {
        await prisma.adminLoginAttempt.create({
            data: {
                ip: `pin_${ip}`,
                count: 1,
                expiresAt: new Date(now.getTime() + windowMs)
            }
        });
        return true;
    }

    if (record.count >= maxAttempts) {
        return false;
    }

    await prisma.adminLoginAttempt.update({
        where: { id: record.id },
        data: { count: record.count + 1 }
    });

    return true;
}

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        
        if (!(await applyPersistentRateLimit(ip))) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 }
            );
        }

        const { pin } = await req.json();

        // Check database first, then fall back to env var
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "global" },
        });

        // Use type assertion to access adminAccessPin as it might be missing from stale IDE types
        // verified correct in schema.prisma and by successful npm build
        const correctPin = (settings as { adminAccessPin?: string | null } | null)?.adminAccessPin || 
                          process.env.ADMIN_ACCESS_PIN;

        if (!correctPin) {
            return NextResponse.json(
                { error: "Access gate not configured" },
                { status: 500 }
            );
        }

        if (!pin || pin !== correctPin) {
            return NextResponse.json(
                { error: "Invalid access code" },
                { status: 401 }
            );
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
