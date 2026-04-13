import { NextResponse } from "next/server";
import { signPinToken, getPinCookieName, getClientIp, normalizeIp } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PIN_LOCKOUT_COOKIE = "pin_lockout";

async function getRateLimitRecord(ip: string) {
    const now = new Date();
    return prisma.adminLoginAttempt.findFirst({
        where: { 
            ip: `pin_${ip}`,
            expiresAt: { gt: now }
        }
    });
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number; count: number }> {
    const now = new Date();
    const maxAttempts = 5;
    
    // 1. Check Browser Lockout Cookie
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    if (cookieStore.get(PIN_LOCKOUT_COOKIE)) {
        return { allowed: false, retryAfter: 15, count: maxAttempts };
    }

    // 2. Clean up old
    prisma.adminLoginAttempt.deleteMany({
        where: { expiresAt: { lt: now } }
    }).catch(() => {});

    const record = await getRateLimitRecord(ip);
    if (!record) return { allowed: true, count: 0 };
    
    if (record.count >= maxAttempts) {
        const retryAfter = Math.ceil((record.expiresAt.getTime() - now.getTime()) / 1000 / 60);
        return { allowed: false, retryAfter, count: record.count };
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
                ip: `pin_${ip}`,
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
        where: { ip: `pin_${ip}` }
    }).catch(() => {});
}

export async function POST(req: Request) {
    try {
        const rawIp = getClientIp(req);
        const normalizedIp = normalizeIp(rawIp);
        console.log(`[VerifyPIN] Request from ${rawIp} (${normalizedIp})`);

        const rateLimit = await checkRateLimit(normalizedIp);
        const maxAttempts = 5;
        
        if (!rateLimit.allowed) {
            const res = NextResponse.json(
                { 
                    error: `Too many attempts. Try again in ${rateLimit.retryAfter} minutes.`,
                    lockedOut: true,
                    retryAfter: rateLimit.retryAfter
                },
                { status: 429 }
            );
            // Set browser-level lockout cookie as backup
            res.cookies.set(PIN_LOCKOUT_COOKIE, "1", { 
                maxAge: 60 * 15,
                httpOnly: true,
                path: "/" 
            });
            return res;
        }

        const { pin } = await req.json();

        // Check settings or env
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "global" },
        });
        const correctPin = (settings as { adminAccessPin?: string | null } | null)?.adminAccessPin || 
                          process.env.ADMIN_ACCESS_PIN;

        if (!correctPin) {
            return NextResponse.json({ error: "Access gate not configured" }, { status: 500 });
        }

        if (!pin || pin !== correctPin) {
            await sleep(800);
            
            // Increment failure count
            const updatedRecord = await incrementRateLimit(normalizedIp);
            const attemptsLeft = Math.max(0, maxAttempts - updatedRecord.count);
            
            return NextResponse.json({ 
                error: "Invalid access code", 
                attemptsLeft 
            }, { status: 401 });
        }

        // Success - Reset failure counter for this IP
        await resetRateLimit(normalizedIp);

        const token = await signPinToken();
        const res = NextResponse.json({ success: true });
        res.cookies.set(getPinCookieName(), token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 300,
        });
        
        // Clear lockout cookie on success
        res.cookies.delete(PIN_LOCKOUT_COOKIE);

        return res;
    } catch (err) {
        console.error("[VerifyPIN] error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}


