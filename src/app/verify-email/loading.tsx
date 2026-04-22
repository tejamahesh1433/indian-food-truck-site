/**
 * This file is shown automatically by Next.js (via React Suspense streaming)
 * while the server component in page.tsx is processing the verification.
 */
import "../verify-email/verify-email.css";

export default function VerifyEmailLoading() {
    return (
        <main className="ve-page">
            {/* Ambient glow */}
            <div className="ve-glow1" />

            <div className="ve-wrap">
                {/* Brand */}
                <div className="ve-logo-row">
                    <div className="ve-logo-badge">C2C</div>
                    <span className="ve-logo-brand">Catch the Cravings</span>
                </div>

                {/* Card */}
                <div className="ve-card">
                    <div className="ve-card-accent" />

                    {/* Dual spinner */}
                    <div className="ve-spinner-wrap">
                        <div className="ve-spinner-outer" />
                        <div className="ve-spinner-inner" />
                        <div className="ve-spinner-dot-wrap">
                            <div className="ve-spinner-dot" />
                        </div>
                    </div>

                    <p className="ve-loading-label">Verifying Your Account</p>
                    <p className="ve-loading-sub">Hang tight…</p>
                </div>

                <p className="ve-footer-text">© 2026 C2C Masala Street Food · Hartford, CT</p>
            </div>
        </main>
    );
}
