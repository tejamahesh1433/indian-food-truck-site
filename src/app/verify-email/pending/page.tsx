import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ResendVerificationButton from "./ResendVerificationButton";
import "../verify-email.css";

export const dynamic = "force-dynamic";

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
        <main className="ve-page">
            <div className="ve-glow1" />
            <div className="ve-glow2" />

            <div className="ve-wrap">
                {/* Brand header */}
                <div className="ve-logo-row">
                    <div className="ve-logo-badge">C2C</div>
                    <span className="ve-logo-brand">Catch the Cravings</span>
                </div>

                {/* Main card */}
                <div className="ve-card">
                    <div className="ve-card-accent" />

                    <div className="ve-icon-email">✉️</div>

                    <h1 className="ve-h1-sm">Check Your Email</h1>
                    <p className="ve-p-md">
                        We&apos;ve sent a verification link to{" "}
                        <span className="ve-p-email-highlight">{user?.email}</span>. Click the link to activate your account.
                    </p>

                    <div className="ve-resend-wrap">
                        <ResendVerificationButton email={user?.email || ""} />

                        <Link href="/login" className="ve-btn-ghost-link">
                            Sign in with a different account
                        </Link>
                    </div>
                </div>

                <div className="ve-footer-line">
                    <p className="ve-footer-text">© 2026 C2C Masala Street Food · Hartford, CT</p>
                </div>
            </div>
        </main>
    );
}
