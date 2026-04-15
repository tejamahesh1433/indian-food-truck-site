"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Link from "next/link";
import { isWellRecognizedEmail, EMAIL_DOMAIN_ERROR } from "@/lib/validation";

// ── Spring configs ───────────────────────────────────────────────────────────
const SPRING = { type: "spring", stiffness: 380, damping: 30 } as const;
const SPRING_SOFT = { type: "spring", stiffness: 260, damping: 28 } as const;

// ── Password strength checker ────────────────────────────────────────────────
const CHECKS = [
    { label: "8+ Characters",     test: (p: string) => p.length >= 8 },
    { label: "Uppercase Letter",  test: (p: string) => /[A-Z]/.test(p) },
    { label: "Lowercase Letter",  test: (p: string) => /[a-z]/.test(p) },
    { label: "Number",            test: (p: string) => /[0-9]/.test(p) },
    { label: "Special Character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

// ── Smooth collapsible name field ────────────────────────────────────────────
function NameField({ show, value, onChange }: {
    show: boolean;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <motion.div
            initial={false}
            animate={{
                height: show ? "auto" : 0,
                opacity: show ? 1 : 0,
                marginBottom: show ? 0 : 0,
            }}
            transition={SPRING_SOFT}
            style={{ overflow: "hidden" }}
        >
            <motion.div
                initial={false}
                animate={{ y: show ? 0 : -12 }}
                transition={SPRING_SOFT}
                className="pb-4"
            >
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                    Full Name
                </label>
                <div className="relative group">
                    <input
                        required={show}
                        tabIndex={show ? 0 : -1}
                        type="text"
                        placeholder="John Doe"
                        autoComplete="name"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-4 text-white placeholder:text-gray-600 outline-none focus:border-orange-500/60 focus:bg-white/[0.06] transition-all duration-300 group-hover:border-white/20"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-orange-500/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Eye toggle icons ─────────────────────────────────────────────────────────
const EyeOpen = () => (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);
const EyeOff = () => (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

// ── Inner form ───────────────────────────────────────────────────────────────
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [mode, setMode] = useState<"login" | "signup">("login");
    const isSignUp = mode === "signup";

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });

    const passwordChecks = CHECKS.map((c) => ({ ...c, met: c.test(formData.password) }));
    const passwordStrong = passwordChecks.every((c) => c.met);
    const strengthScore = passwordChecks.filter((c) => c.met).length;

    function switchMode(next: "login" | "signup") {
        if (next === mode) return;
        setError(null);
        setMode(next);
    }

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
            if (isSignUp) {
                const res = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Signup failed");
                }
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
                if (res?.error) throw new Error("Invalid email or password");
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden bg-[#080808]">

            {/* ── Ambient background ── */}
            <motion.div
                animate={{ opacity: isSignUp ? 0.7 : 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0 pointer-events-none"
            >
                <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[140px]" />
                <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-orange-900/10 rounded-full blur-[120px]" />
                <motion.div
                    animate={{ opacity: isSignUp ? 1 : 0, scale: isSignUp ? 1 : 0.8 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[160px]"
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...SPRING, delay: 0.05 }}
                className="w-full max-w-md z-10"
            >
                {/* ── Card ── */}
                <motion.div
                    layout
                    transition={SPRING_SOFT}
                    className="rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden"
                >
                    {/* ── Top glow bar ── */}
                    <motion.div
                        animate={{ opacity: isSignUp ? 1 : 0.4 }}
                        transition={{ duration: 0.6 }}
                        className="h-px w-full bg-gradient-to-r from-transparent via-orange-500/60 to-transparent"
                    />

                    <div className="p-8 sm:p-10">

                        {/* ── Header ── */}
                        <div className="mb-8 text-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={mode}
                                    initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                                    transition={{ ...SPRING, duration: 0.35 }}
                                >
                                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">
                                        {isSignUp ? "Join the Truck" : "Welcome Back"}
                                    </h1>
                                    <p className="text-gray-500 text-[11px] mt-2.5 uppercase tracking-[0.2em] font-bold font-mono">
                                        {isSignUp ? "Start your flavor journey" : "Authenticate your tastes"}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* ── Tab switcher ── */}
                        <LayoutGroup id="auth-tabs">
                            <div className="flex p-1 bg-black/40 rounded-2xl mb-8 border border-white/[0.06] relative">
                                {(["login", "signup"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => switchMode(tab)}
                                        className="relative flex-1 py-3 text-xs font-black uppercase tracking-widest z-10 transition-colors duration-300"
                                        style={{ color: mode === tab ? "#fff" : "rgb(107 114 128)" }}
                                    >
                                        {mode === tab && (
                                            <motion.span
                                                layoutId="tab-pill"
                                                className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_4px_20px_rgba(249,115,22,0.4)]"
                                                transition={SPRING}
                                            />
                                        )}
                                        <span className="relative z-10">
                                            {tab === "login" ? "Login" : "Sign Up"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </LayoutGroup>

                        {/* ── Form ── */}
                        <form onSubmit={handleSubmit} noValidate>

                            {/* Name field — smoothly collapses/expands */}
                            <NameField
                                show={isSignUp}
                                value={formData.name}
                                onChange={(v) => setFormData((f) => ({ ...f, name: v }))}
                            />

                            {/* Email */}
                            <div className="mb-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <input
                                        required
                                        type="email"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-4 text-white placeholder:text-gray-600 outline-none focus:border-orange-500/60 focus:bg-white/[0.06] transition-all duration-300 group-hover:border-white/20"
                                        value={formData.email}
                                        onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        autoComplete={isSignUp ? "new-password" : "current-password"}
                                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-4 pr-12 text-white placeholder:text-gray-600 outline-none focus:border-orange-500/60 focus:bg-white/[0.06] transition-all duration-300 group-hover:border-white/20"
                                        value={formData.password}
                                        onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-400 transition-colors duration-200 p-1 rounded-lg"
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={showPassword ? "off" : "on"}
                                                initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                exit={{ opacity: 0, scale: 0.6, rotate: 15 }}
                                                transition={{ duration: 0.18 }}
                                                className="block"
                                            >
                                                {showPassword ? <EyeOff /> : <EyeOpen />}
                                            </motion.span>
                                        </AnimatePresence>
                                    </button>
                                </div>
                            </div>

                            {/* Password strength — only in sign-up mode */}
                            <motion.div
                                initial={false}
                                animate={{
                                    height: isSignUp && formData.password.length > 0 ? "auto" : 0,
                                    opacity: isSignUp && formData.password.length > 0 ? 1 : 0,
                                }}
                                transition={SPRING_SOFT}
                                style={{ overflow: "hidden" }}
                            >
                                <div className="pt-3 pb-1 px-1">
                                    {/* Strength bar */}
                                    <div className="flex gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="h-1 flex-1 rounded-full"
                                                animate={{
                                                    backgroundColor:
                                                        strengthScore >= i
                                                            ? strengthScore <= 2 ? "#ef4444"
                                                            : strengthScore <= 3 ? "#f59e0b"
                                                            : "#22c55e"
                                                            : "rgba(255,255,255,0.08)",
                                                }}
                                                transition={{ duration: 0.3, delay: i * 0.04 }}
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        {passwordChecks.map((c) => (
                                            <motion.div
                                                key={c.label}
                                                animate={{ opacity: c.met ? 1 : 0.45 }}
                                                className="flex items-center gap-1.5"
                                            >
                                                <motion.div
                                                    animate={{
                                                        backgroundColor: c.met ? "#22c55e" : "rgba(255,255,255,0.1)",
                                                        scale: c.met ? 1.15 : 1,
                                                    }}
                                                    transition={{ ...SPRING, duration: 0.25 }}
                                                    className="h-1.5 w-1.5 rounded-full shrink-0"
                                                />
                                                <span className={`text-[9px] font-bold tracking-wide transition-colors ${c.met ? "text-green-400" : "text-gray-600"}`}>
                                                    {c.label}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Forgot password — only in login */}
                            <motion.div
                                initial={false}
                                animate={{ height: !isSignUp ? "auto" : 0, opacity: !isSignUp ? 1 : 0 }}
                                transition={SPRING_SOFT}
                                style={{ overflow: "hidden" }}
                            >
                                <div className="flex justify-end pt-2 pb-1">
                                    <Link
                                        href="/forgot-password"
                                        tabIndex={!isSignUp ? 0 : -1}
                                        className="text-[10px] font-black uppercase tracking-widest text-orange-500/70 hover:text-orange-400 transition-colors underline decoration-orange-500/20 underline-offset-4"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Error */}
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                        transition={SPRING}
                                        className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl flex items-start gap-2"
                                    >
                                        <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit button */}
                            <motion.button
                                layout
                                type="submit"
                                disabled={isLoading || (isSignUp && !passwordStrong)}
                                whileHover={{ scale: isLoading ? 1 : 1.015 }}
                                whileTap={{ scale: 0.985 }}
                                transition={SPRING}
                                className="mt-6 w-full relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_12px_40px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2.5 group disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {/* Shine sweep */}
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: isLoading ? "200%" : "-100%" }}
                                    transition={{ duration: 1.2, repeat: isLoading ? Infinity : 0, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
                                />

                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <motion.span
                                            key="loading"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-2"
                                        >
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            {isSignUp ? "Creating Account..." : "Signing In..."}
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key={mode}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center gap-2"
                                        >
                                            {isSignUp ? "Create Account" : "Sign In"}
                                            <motion.svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                animate={{ x: [0, 3, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </motion.svg>
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </form>
                    </div>

                    {/* ── Bottom glow bar ── */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </motion.div>

                {/* ── Back link ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-7 text-center"
                >
                    <Link
                        href="/"
                        className="text-gray-600 hover:text-orange-500 transition-colors duration-300 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 group"
                    >
                        <motion.svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            animate={{ x: [0, -2, 0] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </motion.svg>
                        Back to Home
                    </Link>
                </motion.div>
            </motion.div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center bg-[#080808]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-full border-2 border-orange-500/20 border-t-orange-500"
                />
            </main>
        }>
            <LoginForm />
        </Suspense>
    );
}
