import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin_token";

function secretKey() {
    const s = process.env.JWT_SECRET;
    if (!s) throw new Error("Missing JWT_SECRET");
    return new TextEncoder().encode(s);
}

export async function setAdminCookie() {
    const token = await new SignJWT({ role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey());

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
}

export async function clearAdminCookie() {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
    });
}

export async function isAdminAuthed(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;

    try {
        await jwtVerify(token, secretKey());
        return true;
    } catch {
        return false;
    }
}
