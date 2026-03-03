import { NextResponse } from "next/server";
import { signAdminToken, getAdminCookieName } from "@/lib/adminAuth";

export async function POST(req: Request) {
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
