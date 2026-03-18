import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin_token";

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
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload?.role === "admin";
}

export function getAdminCookieName() {
    return COOKIE_NAME;
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
