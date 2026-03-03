import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminAuth";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow login endpoint
    if (pathname === "/api/admin/login") return NextResponse.next();

    const isAdminPath = pathname.startsWith("/admin");
    const isAdminApi = pathname.startsWith("/api/admin");

    if (!isAdminPath && !isAdminApi) return NextResponse.next();

    const token = req.cookies.get(getAdminCookieName())?.value;
    if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));

    const ok = await verifyAdminToken(token).catch(() => false);
    if (!ok) return NextResponse.redirect(new URL("/admin/login", req.url));

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
