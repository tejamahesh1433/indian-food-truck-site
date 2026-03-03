import { NextResponse } from "next/server";
import { signAdminToken, getAdminCookieName } from "@/lib/adminAuth";

// Simple in-memory rate limit Map. Keys: IP -> { count, expires }
const rateLimitMap = new Map<string, { count: number; expires: number }>();

function applyRateLimit(ip: string): boolean {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    let record = rateLimitMap.get(ip);
    if (!record || record.expires < now) {
        record = { count: 1, expires: now + windowMs };
        rateLimitMap.set(ip, record);
        return true; // Allowed
    }

    if (record.count >= maxAttempts) {
        return false; // Throttled
    }

    record.count++;
    return true; // Allowed
}

export async function POST(req: Request) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!applyRateLimit(ip)) {
        return NextResponse.json(
            { ok: false, error: "Too many login attempts. Please try again in 15 minutes." },
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

    if (password !== process.env.ADMIN_PASSWORD) {
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
