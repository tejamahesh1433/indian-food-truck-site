/**
 * This file is shown automatically by Next.js (via React Suspense streaming)
 * while the server component in page.tsx is processing the verification.
 */
export default function VerifyEmailLoading() {
    return (
        <main
            style={{
                minHeight: "100vh",
                background: "#050505",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Ambient glow */}
            <div
                style={{
                    position: "absolute",
                    top: "-100px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "600px",
                    height: "400px",
                    background: "radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "460px" }}>
                {/* Brand */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "48px", gap: "12px" }}>
                    <div
                        style={{
                            width: "52px", height: "52px", background: "#fff", color: "#000",
                            fontWeight: 900, fontStyle: "italic", fontSize: "16px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: "14px", transform: "rotate(3deg)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                        }}
                    >
                        C2C
                    </div>
                    <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                        Catch the Cravings
                    </span>
                </div>

                {/* Card */}
                <div
                    style={{
                        background: "#0A0A0B",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "32px",
                        padding: "56px 48px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Top accent line */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)" }} />

                    {/* Dual spinner */}
                    <style>{`
                        @keyframes spin-cw  { to { transform: rotate(360deg);  } }
                        @keyframes spin-ccw { to { transform: rotate(-360deg); } }
                        @keyframes pulse-dot { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.1); } }
                    `}</style>

                    <div style={{ position: "relative", width: "80px", height: "80px", marginBottom: "36px" }}>
                        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(249,115,22,0.08)", borderTopColor: "#f97316", animation: "spin-cw 0.9s linear infinite" }} />
                        <div style={{ position: "absolute", inset: "12px", borderRadius: "50%", border: "2px solid transparent", borderBottomColor: "rgba(249,115,22,0.35)", animation: "spin-ccw 1.4s linear infinite" }} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f97316", animation: "pulse-dot 1.2s ease-in-out infinite" }} />
                        </div>
                    </div>

                    <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", margin: "0 0 10px 0" }}>
                        Verifying Your Account
                    </p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", fontWeight: 600, margin: 0 }}>
                        Hang tight…
                    </p>
                </div>

                <p style={{ marginTop: "40px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.12)", textAlign: "center" }}>
                    © 2026 C2C Masala Street Food · Hartford, CT
                </p>
            </div>
        </main>
    );
}
