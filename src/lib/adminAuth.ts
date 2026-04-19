import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "admin_token";
const PIN_COOKIE_NAME = "pin_verified_token";

export async function verifyAdminPassword(password: string): Promise<boolean> {
    let hash = process.env.ADMIN_AUTH_HASH;
    if (!hash) return false;

    // Decode Base64 if needed
    if (hash.length > 60 || !hash.startsWith("$2b$")) {
        try {
            const decoded = Buffer.from(hash, "base64").toString("utf-8");
            if (decoded.startsWith("$2b$")) {
                hash = decoded;
            }
        } catch {
            // Keep original if decode fails
        }
    }

    try {
        return await bcrypt.compare(password, hash);
    } catch {
        return false;
    }
}

function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Missing JWT_SECRET");
    return new TextEncoder().encode(secret);
}

export async function signAdminToken() {
    const secret = getSecret();
    return await new SignJWT({ role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret);
}

export async function verifyAdminToken(token: string) {
    try {
        const secret = getSecret();
        const { payload } = await jwtVerify(token, secret);
        return payload?.role === "admin";
    } catch {
        return false;
    }
}

export async function signPinToken() {
    const secret = getSecret();
    return await new SignJWT({ pin_verified: true })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(secret);
}

export async function verifyPinToken(token: string) {
    try {
        const secret = getSecret();
        const { payload } = await jwtVerify(token, secret);
        return payload?.pin_verified === true;
    } catch {
        return false;
    }
}

export function getAdminCookieName() {
    return COOKIE_NAME;
}

export function getPinCookieName() {
    return PIN_COOKIE_NAME;
}

export function getClientIp(req: Request): string {
    const xForwardedFor = req.headers.get("x-forwarded-for");
    if (xForwardedFor) return xForwardedFor.split(",")[0].trim();
    
    const xRealIp = req.headers.get("x-real-ip");
    if (xRealIp) return xRealIp;

    const cfIp = req.headers.get("cf-connecting-ip");
    if (cfIp) return cfIp;

    return "127.0.0.1";
}

export function normalizeIp(ip: string): string {
    if (ip === "::1" || ip === "::ffff:127.0.0.1" || ip === "localhost") return "127.0.0.1";
    return ip;
}

export async function isAdmin() {
    try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token = cookieStore.get(getAdminCookieName())?.value;
        if (!token) return false;
        return await verifyAdminToken(token);
    } catch {
        return false;
    }
}

