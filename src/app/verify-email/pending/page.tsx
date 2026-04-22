import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ResendVerificationButton from "./ResendVerificationButton";

export const dynamic = "force-dynamic";

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
    iconWrap: {
        width: "80px",
        height: "80px",
        borderRadius: "26px",
        background: "rgba(249,115,22,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "32px",
        marginBottom: "32px",
        border: "1px solid rgba(249,115,22,0.2)",
        boxShadow: "0 12px 40px rgba(249,115,22,0.1)",
    },
    h1: {
        fontSize: "30px",
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
        maxWidth: "320px",
    },
    resendWrap: {
        width: "100%",
        display: "flex",
        flexDirection: "column" as const,
        gap: "12px",
    },
    ghostBtn: {
        display: "block",
        width: "100%",
        padding: "16px 32px",
        color: "rgba(255,255,255,0.4)",
        fontWeight: 800,
        fontSize: "10px",
        letterSpacing: "0.15em",
        textTransform: "uppercase" as const,
        textDecoration: "none",
        marginTop: "12px",
        transition: "color 0.2s",
        textAlign: "center" as const,
    },
    footerLine: {
        marginTop: "40px",
        paddingTop: "32px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        width: "100%",
    },
    footerText: {
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.2em",
        textTransform: "uppercase" as const,
        color: "rgba(255,255,255,0.12)",
        textAlign: "center" as const,
    }
};

export default async function VerificationPendingPage(props: { searchParams: Promise<{ email?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getServerSession(authOptions);
    const emailParam = searchParams.email;

    if (!session?.user && !emailParam) {
        redirect("/login");
    }

    const email = session?.user?.email || emailParam;

    const user = await prisma.user.findUnique({
        where: { email: email! },
        select: { emailVerified: true, email: true }
    });

    const settings = await prisma.siteSettings.findUnique({
        where: { id: "global" },
        select: { emailVerificationRequired: true }
    });

    // If verification is no longer required or user is already verified, send them to profile
    if (!settings?.emailVerificationRequired || user?.emailVerified) {
        redirect("/profile");
    }

    return (
        <main style={S.page}>
            <div style={S.glow1} />
            <div style={S.glow2} />

            <div style={S.wrap}>
                {/* Brand header */}
                <div style={S.logoRow}>
                    <div style={S.logoBadge}>C2C</div>
                    <span style={S.logoBrand}>Catch the Cravings</span>
                </div>

                {/* Main card */}
                <div style={S.card}>
                    <div style={S.cardAccent} />
                    
                    <div style={S.iconWrap}>✉️</div>

                    <h1 style={S.h1}>Check Your Email</h1>
                    <p style={S.p}>
                        We&apos;ve sent a verification link to <span style={{ color: "#fff", fontWeight: 700 }}>{user?.email}</span>. Click the link to activate your account.
                    </p>

                    <div style={S.resendWrap}>
                        <ResendVerificationButton email={user?.email || ""} />
                        
                        <Link href="/login" style={S.ghostBtn}>
                            Sign in with a different account
                        </Link>
                    </div>
                </div>

                <div style={S.footerLine}>
                    <p style={S.footerText}>© 2026 C2C Masala Street Food · Hartford, CT</p>
                </div>
            </div>
        </main>
    );
}
