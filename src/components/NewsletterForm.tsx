"use client";

import { useState } from "react";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus("loading");
        setErrorMsg("");

        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Something went wrong.");
            }

            setStatus("success");
            setEmail("");
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4">
                <span className="text-2xl">🎉</span>
                <div>
                    <p className="font-black text-sm text-green-400 uppercase tracking-widest">You&apos;re in!</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">We&apos;ll let you know about new spots and specials.</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setErrorMsg(""); }}
                    required
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/50 transition placeholder:text-gray-600 w-full"
                />
                <button
                    type="submit"
                    disabled={status === "loading"}
                    className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition shrink-0 w-full sm:w-auto"
                >
                    {status === "loading" ? "..." : "Subscribe"}
                </button>
            </div>
            {status === "error" && (
                <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errorMsg}
                </p>
            )}
            <p className="text-[10px] text-gray-600">No spam, ever. Unsubscribe any time.</p>
        </form>
    );
}
