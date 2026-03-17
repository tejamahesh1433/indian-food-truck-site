"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<"pin" | "login">("pin");
    const [pin, setPin] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handlePinChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (value && !/^\d$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setErr(null);

        // Auto-focus next input
        if (value && index < 5) {
            pinRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (value && index === 5 && newPin.every((d) => d !== "")) {
            verifyPin(newPin.join(""));
        }
    };

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            pinRefs.current[index - 1]?.focus();
        }
        if (e.key === "Enter") {
            const fullPin = pin.join("");
            if (fullPin.length === 6) {
                verifyPin(fullPin);
            }
        }
    };

    const handlePinPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            const newPin = pasted.split("");
            setPin(newPin);
            pinRefs.current[5]?.focus();
            verifyPin(pasted);
        }
    };

    async function verifyPin(code: string) {
        setLoading(true);
        setErr(null);

        try {
            const res = await fetch("/api/verify-pin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: code }),
            });

            if (!res.ok) {
                setShake(true);
                setTimeout(() => setShake(false), 500);
                setPin(["", "", "", "", "", ""]);
                pinRefs.current[0]?.focus();
                setErr("Invalid access code");
                setLoading(false);
                return;
            }

            setStep("login");
        } catch {
            setErr("Connection error");
        } finally {
            setLoading(false);
        }
    }

    async function onLoginSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        setLoading(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setErr(data?.error || "Login failed");
            return;
        }

        router.push("/admin");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/3 -left-1/4 w-96 h-96 bg-red-900/15 rounded-full blur-[128px]" />
            <div className="absolute bottom-1/3 -right-1/4 w-96 h-96 bg-orange-900/10 rounded-full blur-[128px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <Link href="/" className="inline-flex items-center gap-2 mb-6 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-orange-500 transition">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Website
                </Link>

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === "pin" ? (
                            <motion.div
                                key="pin"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">
                                        Restricted Area
                                    </h1>
                                    <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold font-mono">
                                        Enter 6-digit access code
                                    </p>
                                </div>

                                <motion.div
                                    animate={shake ? { x: [0, -12, 12, -12, 12, 0] } : {}}
                                    transition={{ duration: 0.4 }}
                                    className="flex justify-center gap-2"
                                    onPaste={handlePinPaste}
                                >
                                    {pin.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { pinRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handlePinChange(i, e.target.value)}
                                            onKeyDown={(e) => handlePinKeyDown(i, e)}
                                            title={`Access code digit ${i + 1}`}
                                            aria-label={`Access code digit ${i + 1}`}
                                            className={`w-12 h-14 text-center text-xl font-black rounded-xl border outline-none transition-all duration-200 bg-black/50
                                                ${digit ? "border-orange-500/50 text-orange-400" : "border-white/10 text-white"}
                                                ${err ? "border-red-500/50" : ""}
                                                focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30`}
                                            autoFocus={i === 0}
                                            disabled={loading}
                                        />
                                    ))}
                                </motion.div>

                                {err && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center text-red-400 text-xs font-bold"
                                    >
                                        {err}
                                    </motion.p>
                                )}

                                {loading && (
                                    <div className="flex justify-center">
                                        <svg className="animate-spin h-5 w-5 text-orange-500" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">
                                        Admin Login
                                    </h1>
                                    <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold font-mono">
                                        Access verified · Enter password
                                    </p>
                                </div>

                                <form onSubmit={onLoginSubmit} className="space-y-4">
                                    <input
                                        className="w-full rounded-xl border border-white/10 px-4 py-4 bg-black/50 text-white outline-none focus:border-orange-500/50 transition placeholder:text-gray-600"
                                        type="password"
                                        placeholder="Admin password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoFocus
                                    />

                                    {err && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl"
                                        >
                                            {err}
                                        </motion.div>
                                    )}

                                    <button
                                        className="w-full rounded-2xl bg-orange-600 font-black uppercase tracking-widest px-4 py-4 text-white disabled:opacity-50 transition hover:bg-orange-500 shadow-[0_12px_40px_rgba(249,115,22,0.25)] flex items-center justify-center gap-2 group"
                                        disabled={loading || !password}
                                    >
                                        {loading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : (
                                            <>
                                                Sign In
                                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
