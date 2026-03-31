"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setStatus("loading");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("If your email is registered, a password reset link has been sent.");
            } else {
                setStatus("error");
                setMessage(data.error || "Something went wrong.");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
            setMessage("An unexpected error occurred. Please try again.");
        }
    };

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
                        IFT
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">
                        Reset Password
                    </h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        We&apos;ll send you a secure link
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
                    <AnimatePresence mode="wait">
                        {status === "success" ? (
                            <motion.div
                                key="success-state"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="mb-4 text-4xl">📧</div>
                                <h2 className="text-xl font-black italic tracking-tighter mb-2 text-green-400">
                                    Check Your Inbox
                                </h2>
                                <p className="text-sm text-gray-400 mb-6">
                                    {message}
                                </p>
                                <Link
                                    href="/login"
                                    className="w-full inline-block bg-white text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition"
                                >
                                    Return to Login
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="request-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                                        Account Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter the email associated with your account"
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
                                    disabled={status === "loading" || !email}
                                    className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-[0_10px_20px_rgba(249,115,22,0.2)]"
                                >
                                    {status === "loading" ? "Sending..." : "Send Reset Link"}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <div className="text-center mt-6">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-orange-500 transition group"
                    >
                        <svg className="w-3 h-3 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
