import { NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/adminAuth";

export async function POST(req: Request) {
    const { password } = await req.json().catch(() => ({ password: "" }));

    if (!process.env.ADMIN_PASSWORD) {
        return NextResponse.json(
            { ok: false, error: "Server not configured" },
            { status: 500 }
        );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
    }

    await setAdminCookie();
    return NextResponse.json({ ok: true });
}
