import { NextResponse } from "next/server";
import { signAdminToken, getAdminCookieName } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

async function applyPersistentRateLimit(ip: string): Promise<boolean> {
    const now = new Date();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    // Clean up expired records (optional, but good for DB size)
    // We do it asynchronously to not block the login request
    prisma.adminLoginAttempt.deleteMany({
        where: { expiresAt: { lt: now } }
    }).catch(() => {});

    const record = await prisma.adminLoginAttempt.findFirst({
        where: { 
            ip,
            expiresAt: { gt: now }
        }
    });

    if (!record) {
        await prisma.adminLoginAttempt.create({
            data: {
                ip,
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

/**
 * Timing-safe string comparison.
 * Hashing both strings first to ensure equal length for timingSafeEqual.
 */
function isPasswordCorrect(input: string, correct: string): boolean {
    const inputHash = crypto.createHash("sha256").update(input).digest();
    const correctHash = crypto.createHash("sha256").update(correct).digest();
    return crypto.timingSafeEqual(inputHash, correctHash);
}

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    if (!(await applyPersistentRateLimit(ip))) {
        return NextResponse.json(
            { ok: false, error: "Too many login attempts. Please try again later." },
            { status: 429 }
        );
    }

    const { password } = await req.json().catch(() => ({ password: "" }));

    if (!process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
        return NextResponse.json(
            { ok: false, error: "Server not configured" },
            { status: 500 }
        );
    }

    if (!isPasswordCorrect(password, process.env.ADMIN_PASSWORD)) {
        return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
    }

    const token = await signAdminToken();

    const res = NextResponse.json({ ok: true });
    res.cookies.set(getAdminCookieName(), token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
    return res;
}
