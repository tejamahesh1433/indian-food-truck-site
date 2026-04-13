import { NextResponse } from "next/server";
import { getPinCookieName } from "@/lib/adminAuth";

export async function POST() {
    const res = NextResponse.json({ success: true });
    res.cookies.delete(getPinCookieName());
    return res;
}
