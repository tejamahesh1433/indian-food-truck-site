"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!token) {
            setStatus("error");
            setMessage("Invalid or missing reset token. Please request a new link.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setStatus("error");
            setMessage("Password must be at least 6 characters.");
            return;
        }

        setStatus("loading");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("Your password has been successfully updated.");
                setTimeout(() => {
                    router.push("/login?reset=success");
                }, 3000);
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to update password.");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
            setMessage("An unexpected error occurred. Please try again.");
        }
    };

    if (!token) {
        return (
            <div className="text-center p-8 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md">
                <div className="mb-4 text-4xl">⚠️</div>
                <h2 className="text-xl font-black italic tracking-tighter mb-2 text-red-500">
                    Invalid Link
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                    This password reset link is invalid or has expired.
                </p>
                <button
                    onClick={() => router.push("/forgot-password")}
                    className="w-full inline-block bg-white text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition"
                >
                    Request New Link
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
            <AnimatePresence mode="wait">
                {status === "success" ? (
                    <motion.div
                        key="success-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="mb-4 text-4xl">🔐</div>
                        <h2 className="text-xl font-black italic tracking-tighter mb-2 text-green-400">
                            Password Updated
                        </h2>
                        <p className="text-sm text-gray-400 mb-6">
                            {message} Redirecting to login...
                        </p>
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </motion.div>
                ) : (
                    <motion.form
                        key="reset-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Create a strong password"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition placeholder:text-gray-700"
                            />

                            {newPassword.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="px-2 pt-3 pb-2 space-y-2"
                                >
                                    <div className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-1">Security Checklist</div>
                                    <div className="grid grid-cols-1 gap-1.5">
                                        {[
                                            { label: "8+ Characters", met: newPassword.length >= 8 },
                                            { label: "Uppercase Letter", met: /[A-Z]/.test(newPassword) },
                                            { label: "Lowercase Letter", met: /[a-z]/.test(newPassword) },
                                            { label: "Number", met: /[0-9]/.test(newPassword) },
                                            { label: "Special Character", met: /[^A-Za-z0-9]/.test(newPassword) },
                                        ].map((req) => (
                                            <div key={req.label} className="flex items-center gap-2">
                                                <div className={`h-1.2 w-1.2 rounded-full transition-colors ${req.met ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-white/10"}`} />
                                                <span className={`text-[9px] font-black tracking-tight transition-colors ${req.met ? "text-green-400/80" : "text-gray-600"}`}>
                                                    {req.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Retype new password"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition placeholder:text-gray-700"
                            />
                        </div>

                        {status === "error" && (
                            <p className="text-xs text-red-500 font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={
                                status === "loading" || 
                                !newPassword || 
                                !confirmPassword || 
                                newPassword !== confirmPassword || 
                                !(newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword))
                            }
                            className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-[0_10px_20px_rgba(249,115,22,0.2)]"
                        >
                            {status === "loading" ? "Updating..." : "Update Password"}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="mt-8 bg-orange-500 text-white w-14 h-14 mx-auto rounded-xl flex items-center justify-center font-black text-2xl italic shadow-[0_10px_30px_rgba(249,115,22,0.3)] mb-6">
                        C2C
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
                        Create New Password
                    </h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Your account is almost secured
                    </p>
                </div>

                <Suspense fallback={<div className="text-center text-gray-500 uppercase tracking-widest text-[10px] font-bold">Verifying Secure Link...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </motion.div>
        </main>
    );
}
