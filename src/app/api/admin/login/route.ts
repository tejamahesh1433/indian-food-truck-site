import { NextResponse } from "next/server";
import { 
    signAdminToken, 
    getAdminCookieName, 
    verifyPinToken, 
    getPinCookieName, 
    getClientIp, 
    normalizeIp
} from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getRateLimitRecord(ip: string) {
    const now = new Date();
    return prisma.adminLoginAttempt.findFirst({
        where: { 
            ip: `login_${ip}`,
            expiresAt: { gt: now }
        }
    });
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; count: number }> {
    const now = new Date();
    const maxAttempts = 5;

    // Clean up expired records
    prisma.adminLoginAttempt.deleteMany({
        where: { expiresAt: { lt: now } }
    }).catch(() => {});

    const record = await getRateLimitRecord(ip);
    if (!record) return { allowed: true, count: 0 };

    if (record.count >= maxAttempts) {
        return { allowed: false, count: record.count };
    }

    return { allowed: true, count: record.count };
}

async function incrementRateLimit(ip: string) {
    const now = new Date();
    const windowMs = 15 * 60 * 1000;
    const record = await getRateLimitRecord(ip);

    if (!record) {
        return prisma.adminLoginAttempt.create({
            data: {
                ip: `login_${ip}`,
                count: 1,
                expiresAt: new Date(now.getTime() + windowMs)
            }
        });
    }

    return prisma.adminLoginAttempt.update({
        where: { id: record.id },
        data: { count: record.count + 1 }
    });
}

async function resetRateLimit(ip: string) {
    return prisma.adminLoginAttempt.deleteMany({
        where: { ip: `login_${ip}` }
    }).catch(() => {});
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const rawIp = getClientIp(req);
    const normalizedIp = normalizeIp(rawIp);
    const maxAttempts = 5;

    // 0. CSRF: reject requests that originate from a different host
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host) {
        let originHost: string;
        try {
            originHost = new URL(origin).host;
        } catch {
            console.warn(`[Login] CSRF guard: unparseable origin "${origin}" from ${normalizedIp}`);
            return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
        }
        if (originHost.toLowerCase() !== host.toLowerCase()) {
            console.warn(`[Login] CSRF guard: origin "${origin}" does not match host "${host}" from ${normalizedIp}`);
            return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
        }
    }

    // 1. PIN Check (Bypass Protection)
    const cookieStore = await cookies();
    const pinToken = cookieStore.get(getPinCookieName())?.value;
    
    if (!pinToken || !(await verifyPinToken(pinToken))) {
        console.warn(`[Login] Forbidden: Missing/Invalid PIN token from ${normalizedIp}`);
        return NextResponse.json(
            { ok: false, error: "Access gate not verified. Please enter the PIN first." },
            { status: 403 }
        );
    }

    const rateLimit = await checkRateLimit(normalizedIp);
    if (!rateLimit.allowed) {
        console.warn(`[Login] Rate limited: ${normalizedIp}`);
        return NextResponse.json(
            { ok: false, error: "Too many login attempts. Please try again later." },
            { status: 429 }
        );
    }

    const { password: rawPassword } = await req.json().catch(() => ({ password: "" }));
    const password = rawPassword.trim(); // Resilient to accidental spaces

    if (!process.env.JWT_SECRET) {
        return NextResponse.json(
            { ok: false, error: "Server not configured" },
            { status: 500 }
        );
    }

    // --- BULLETPROOF PASSWORD CHECK ---
    let hash = process.env.ADMIN_AUTH_HASH;
    let source = "process.env";
    
    // Fail-safe: read from .env if process.env misses it
    if (!hash) {
        try {
            const envContent = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
            const match = envContent.match(/ADMIN_AUTH_HASH=['"]?([^'"\s]+)['"]?/);
            if (match) {
                hash = match[1];
                source = "disk (.env)";
            }
        } catch (e) {}
    }

    if (!hash) {
        console.error("[Login] CRITICAL: Password hash not found anywhere.");
        return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });
    }

    // --- BASE64 FAIL-SAFE ---
    // If the hash is Base64 encoded (to protect special chars), decode it
    if (hash.length > 60 || !hash.startsWith("$2b$")) {
        try {
            const decoded = Buffer.from(hash, "base64").toString("utf-8");
            if (decoded.startsWith("$2b$")) {
                hash = decoded;
            }
        } catch (e) {}
    }

    const isCorrect = await bcrypt.compare(password, hash).catch(() => false);
    // --- END BULLETPROOF CHECK ---

    if (!isCorrect) {
        console.warn(`[Login] Failed: Wrong password from ${normalizedIp}`);
        await sleep(1000); // Artificial delay to slow down brute-force
        
        // Increment failure count
        const updatedRecord = await incrementRateLimit(normalizedIp);
        const attemptsLeft = Math.max(0, maxAttempts - updatedRecord.count);

        return NextResponse.json({ 
            ok: false, 
            error: "Wrong password", 
            attemptsLeft 
        }, { status: 401 });
    }

    console.log(`[Login] Success: Admin logged in from ${normalizedIp}`);
    
    // Clear failure counter for this IP on successful login
    await resetRateLimit(normalizedIp);

    const token = await signAdminToken();

    const res = NextResponse.json({ ok: true });
    
    // Set admin token
    res.cookies.set(getAdminCookieName(), token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    // Clear PIN token as it's no longer needed
    res.cookies.delete(getPinCookieName());

    return res;
}


