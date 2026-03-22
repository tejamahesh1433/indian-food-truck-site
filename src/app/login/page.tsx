"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { isWellRecognizedEmail, EMAIL_DOMAIN_ERROR } from "@/lib/validation";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!isWellRecognizedEmail(formData.email)) {
            setError(EMAIL_DOMAIN_ERROR);
            setIsLoading(false);
            return;
        }

        try {
            if (mode === "signup") {
                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Signup failed");
                }

                // After signup, auto-login
                const loginRes = await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (loginRes?.error) throw new Error("Auto-login failed after signup");
                router.push(callbackUrl);
                router.refresh();
            } else {
                const res = await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (res?.error) {
                    throw new Error("Invalid email or password");
                }

                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#0a0a0a]">
            {/* Background Glow */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-[128px]" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-orange-900/10 rounded-full blur-[128px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">
                            {mode === "login" ? "Welcome Back" : "Join the Truck"}
                        </h1>
                        <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest font-bold font-mono">
                            {mode === "login" ? "Authenticating for Tastes" : "Start your flavor journey"}
                        </p>
                    </div>

                    <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
                        <button
                            onClick={() => setMode("login")}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "login" ? "bg-orange-600 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setMode("signup")}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "signup" ? "bg-orange-600 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode}
                                initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                                className="space-y-4"
                            >
                                {mode === "signup" && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-gray-600 outline-none focus:border-orange-500/50 transition"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-gray-600 outline-none focus:border-orange-500/50 transition"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Password</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-12 text-white placeholder:text-gray-600 outline-none focus:border-orange-500/50 transition"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            title={showPassword ? "Hide password" : "Show password"}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword((p) => !p)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-orange-400 transition-all duration-200 active:scale-75 p-1.5 rounded-xl hover:bg-white/10"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            disabled={isLoading}
                            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition shadow-[0_12px_40px_rgba(249,115,22,0.25)] flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <>
                                    {mode === "login" ? "Sign In" : "Register"}
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-gray-500 hover:text-orange-500 transition text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
