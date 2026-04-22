import { prisma } from "@/lib/prisma";
import Link from "next/link";
import "./verify-email.css";

// Force dynamic so searchParams are always read fresh (never cached)
export const dynamic = "force-dynamic";

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
        <main className="ve-page">
            <div className="ve-glow1" />
            <div className="ve-glow2" />

            <div className="ve-wrap">
                {/* Brand */}
                <div className="ve-logo-row">
                    <div className="ve-logo-badge">C2C</div>
                    <span className="ve-logo-brand">Catch the Cravings</span>
                </div>

                {/* Card */}
                <div className="ve-card">
                    <div className="ve-card-accent" />

                    {result.success ? (
                        <>
                            <div className="ve-icon-success">✓</div>
                            <h1 className="ve-h1">You&apos;re In!</h1>
                            <p className="ve-p">{result.message}</p>
                            <Link href="/login" className="ve-btn-primary">
                                Log In Now →
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="ve-icon-error">✕</div>
                            <h1 className="ve-h1 ve-h1-error">Link Expired</h1>
                            <p className="ve-p">{result.message}</p>
                            <Link href="/login" className="ve-btn-primary">
                                Try Logging In
                            </Link>
                            <Link href="/" className="ve-btn-ghost">
                                Back to Home
                            </Link>
                        </>
                    )}
                </div>

                <p className="ve-footer-text">© 2026 C2C Masala Street Food · Hartford, CT</p>
            </div>
        </main>
    );
}
