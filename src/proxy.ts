import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminCookieName, verifyAdminToken } from "@/lib/adminAuth";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── ADMIN PROTECTION ───────────────────────────────────────────────────
    const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/truckadmin");
    const isAdminApi = pathname.startsWith("/api/admin");

    if (isAdminPath || isAdminApi) {
        // Allow login endpoints
        if (pathname === "/api/admin/login" || pathname === "/truckadmin/login") {
            return NextResponse.next();
        }

        const token = req.cookies.get(getAdminCookieName())?.value;
        if (!token) return NextResponse.redirect(new URL("/truckadmin/login", req.url));

        const ok = await verifyAdminToken(token).catch(() => false);
        if (!ok) return NextResponse.redirect(new URL("/truckadmin/login", req.url));
        
        return NextResponse.next();
    }

    // ── CUSTOMER PROTECTION ────────────────────────────────────────────────
    if (pathname.startsWith("/profile")) {
        const token = await getToken({ req });
        
        if (!token) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // If email verification is required and user is unverified
        // (Note: Verification check logic can also be in the page, 
        // but this adds a middleware layer protection)
        if (!token.emailVerified && pathname !== "/verify-email/pending") {
            // We redirect to pending page. 
            // We can't strictly check SiteSettings here without Prisma (slow in middleware),
            // but the token already contains the state from sign-in time.
            return NextResponse.redirect(new URL("/verify-email/pending", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*", 
        "/truckadmin/:path*", 
        "/api/admin/:path*",
        "/profile/:path*"
    ],
};
