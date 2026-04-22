"use client";

import { useState } from "react";
import "../verify-email.css";

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
        } catch {
            setStatus("error");
            setMessage("Network error.");
        }
    }

    const btnClass = [
        "ve-resend-btn",
        status === "success" ? "ve-resend-btn-success"
            : status === "error" ? "ve-resend-btn-error"
            : status === "loading" ? "ve-resend-btn-loading"
            : "ve-resend-btn-idle",
    ].join(" ");

    return (
        <div className="ve-resend-wrap">
            <button
                onClick={handleResend}
                disabled={status === "loading" || status === "success"}
                className={btnClass}
            >
                {status === "loading" ? (
                    <>
                        <div className="ve-resend-spinner" />
                        Sending...
                    </>
                ) : status === "success" ? (
                    "Email Sent!"
                ) : (
                    "Resend Verification Email"
                )}
            </button>
            {message && (
                <p className={status === "success" ? "ve-resend-msg-success" : "ve-resend-msg-error"}>
                    {message}
                </p>
            )}
        </div>
    );
}
