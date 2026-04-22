import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Force dynamic so searchParams are always read fresh (never cached)
export const dynamic = "force-dynamic";

// ─── Inline styles ────────────────────────────────────────────────────────────
const S = {
    page: {
        minHeight: "100vh",
        background: "#050505",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        position: "relative" as const,
        overflow: "hidden",
    },
    glow1: {
        position: "absolute" as const,
        top: "-100px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "600px",
        height: "400px",
        background: "radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)",
        pointerEvents: "none" as const,
    },
    glow2: {
        position: "absolute" as const,
        bottom: "-100px",
        right: "-50px",
        width: "400px",
        height: "400px",
        background: "radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)",
        pointerEvents: "none" as const,
    },
    wrap: {
        position: "relative" as const,
        zIndex: 10,
        width: "100%",
        maxWidth: "460px",
    },
    logoRow: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        marginBottom: "48px",
        gap: "12px",
    },
    logoBadge: {
        width: "52px",
        height: "52px",
        background: "#fff",
        color: "#000",
        fontWeight: 900,
        fontStyle: "italic",
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "14px",
        transform: "rotate(3deg)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    },
    logoBrand: {
        fontSize: "9px",
        fontWeight: 800,
        letterSpacing: "0.25em",
        textTransform: "uppercase" as const,
        color: "rgba(255,255,255,0.3)",
    },
    card: {
        background: "#0A0A0B",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "32px",
        padding: "56px 48px",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        textAlign: "center" as const,
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        position: "relative" as const,
        overflow: "hidden" as const,
    },
    cardAccent: {
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)",
    },
    successIcon: {
        width: "88px",
        height: "88px",
        borderRadius: "28px",
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "40px",
        marginBottom: "32px",
        boxShadow: "0 20px 60px rgba(34,197,94,0.35)",
        border: "1px solid rgba(74,222,128,0.3)",
        color: "white",
    },
    errorIcon: {
        width: "88px",
        height: "88px",
        borderRadius: "28px",
        background: "rgba(239,68,68,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "40px",
        marginBottom: "32px",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#f87171",
    },
    h1: {
        fontSize: "32px",
        fontWeight: 900,
        fontStyle: "italic",
        letterSpacing: "-0.04em",
        textTransform: "uppercase" as const,
        color: "#fff",
        margin: "0 0 16px 0",
    },
    p: {
        fontSize: "15px",
        lineHeight: "1.7",
        color: "rgba(255,255,255,0.45)",
        margin: "0 0 40px 0",
        maxWidth: "300px",
    },
    primaryBtn: {
        display: "block",
        width: "100%",
        padding: "18px 32px",
        background: "#f97316",
        color: "#fff",
        fontWeight: 800,
        fontSize: "11px",
        letterSpacing: "0.15em",
        textTransform: "uppercase" as const,
        borderRadius: "14px",
        textDecoration: "none",
        boxShadow: "0 12px 40px rgba(249,115,22,0.35)",
        border: "none",
        cursor: "pointer",
        boxSizing: "border-box" as const,
    },
    ghostBtn: {
        display: "block",
        width: "100%",
        padding: "16px 32px",
        background: "rgba(255,255,255,0.04)",
        color: "rgba(255,255,255,0.6)",
        fontWeight: 800,
        fontSize: "10px",
        letterSpacing: "0.15em",
        textTransform: "uppercase" as const,
        borderRadius: "14px",
        textDecoration: "none",
        border: "1px solid rgba(255,255,255,0.08)",
        marginTop: "12px",
        cursor: "pointer",
        boxSizing: "border-box" as const,
    },
    footerText: {
        marginTop: "40px",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.2em",
        textTransform: "uppercase" as const,
        color: "rgba(255,255,255,0.12)",
        textAlign: "center" as const,
    },
};

// ─── Server-side verification logic ──────────────────────────────────────────
async function verifyToken(token: string, email: string): Promise<{ success: boolean; message: string }> {
    try {
        const record = await prisma.verificationToken.findUnique({ where: { token } });

        if (!record || record.identifier !== email) {
            return { success: false, message: "This link has already been used or is invalid. Try logging in, or request a new verification email." };
        }

        if (record.expires < new Date()) {
            return { success: false, message: "This link has expired. Please request a new verification email." };
        }

        // Mark user as verified
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        });

        // Delete the used token
        await prisma.verificationToken.delete({ where: { token } });

        return { success: true, message: "Your email address has been verified. Redirecting you to login…" };
    } catch (err) {
        console.error("[verify-email page] Error:", err);
        return { success: false, message: "Something went wrong. Please try again or contact support." };
    }
}

// ─── Page component (Server Component — no loading state needed) ──────────────
export default async function VerifyEmailPage(props: {
    searchParams: Promise<{ token?: string; email?: string }>;
}) {
    const searchParams = await props.searchParams;
    const token = searchParams.token;
    const email = searchParams.email;

    let result: { success: boolean; message: string };

    if (!token || !email) {
        result = { success: false, message: "Invalid verification link — missing token or email. Please use the link from your email." };
    } else {
        result = await verifyToken(token, email);
    }

    return (
        <main style={S.page}>
            <div style={S.glow1} />
            <div style={S.glow2} />

            <div style={S.wrap}>
                {/* Brand */}
                <div style={S.logoRow}>
                    <div style={S.logoBadge}>C2C</div>
                    <span style={S.logoBrand}>Catch the Cravings</span>
                </div>

                {/* Card */}
                <div style={S.card}>
                    <div style={S.cardAccent} />

                    {result.success ? (
                        <>
                            <div style={S.successIcon}>✓</div>
                            <h1 style={S.h1}>You&apos;re In!</h1>
                            <p style={S.p}>{result.message}</p>
                            <Link href="/login" style={S.primaryBtn}>
                                Log In Now →
                            </Link>
                        </>
                    ) : (
                        <>
                            <div style={S.errorIcon}>✕</div>
                            <h1 style={{ ...S.h1, color: "#fca5a5" }}>Link Expired</h1>
                            <p style={S.p}>{result.message}</p>
                            <Link href="/login" style={S.primaryBtn}>
                                Try Logging In
                            </Link>
                            <Link href="/" style={S.ghostBtn}>
                                Back to Home
                            </Link>
                        </>
                    )}
                </div>

                <p style={S.footerText}>© 2026 C2C Masala Street Food · Hartford, CT</p>
            </div>
        </main>
    );
}
