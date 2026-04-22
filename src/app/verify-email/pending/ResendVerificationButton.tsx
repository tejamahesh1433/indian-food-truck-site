"use client";

import { useState } from "react";

export default function ResendVerificationButton({ email }: { email: string }) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleResend() {
        setStatus("loading");
        try {
            const res = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStatus("success");
                setMessage("New link sent!");
                setTimeout(() => setStatus("idle"), 5000);
            } else {
                setStatus("error");
                setMessage("Failed to send. Try again.");
            }
        } catch (err) {
            setStatus("error");
            setMessage("Network error.");
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
            <button
                onClick={handleResend}
                disabled={status === "loading" || status === "success"}
                style={{
                    width: "100%",
                    padding: "18px 32px",
                    background: status === "success" 
                        ? "rgba(34,197,94,0.1)" 
                        : status === "error"
                        ? "rgba(239,68,68,0.1)"
                        : "#f97316",
                    color: status === "success" 
                        ? "#4ade80" 
                        : status === "error"
                        ? "#f87171"
                        : "#fff",
                    fontWeight: 800,
                    fontSize: "11px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    borderRadius: "14px",
                    border: (status === "success" || status === "error") 
                        ? `1px solid ${status === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`
                        : "none",
                    cursor: (status === "loading" || status === "success") ? "default" : "pointer",
                    boxShadow: status === "idle" ? "0 12px 40px rgba(249,115,22,0.35)" : "none",
                    transition: "all 0.2s",
                    opacity: status === "loading" ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                }}
            >
                {status === "loading" ? (
                    <>
                        <style>{`@keyframes resend-spin { to { transform: rotate(360deg); } }`}</style>
                        <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "resend-spin 0.6s linear infinite" }} />
                        Sending...
                    </>
                ) : status === "success" ? (
                    "Email Sent!"
                ) : (
                    "Resend Verification Email"
                )}
            </button>
            {message && (
                <p style={{ 
                    fontSize: "10px", 
                    fontWeight: 700, 
                    textTransform: "uppercase", 
                    letterSpacing: "0.1em",
                    color: status === "success" ? "#4ade80" : "#f87171",
                    textAlign: "center",
                    margin: "4px 0 0 0"
                }}>
                    {message}
                </p>
            )}
        </div>
    );
}
