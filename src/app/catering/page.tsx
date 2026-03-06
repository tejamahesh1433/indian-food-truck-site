"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSite } from "@/components/SiteProvider";

export default function CateringPage() {
    const site = useSite();
    const router = useRouter();
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [phoneStr, setPhoneStr] = useState("");
    const [prevChatToken, setPrevChatToken] = useState<string | null>(null);

    useState(() => {
        // Initial check for token (runs once on mount)
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("catering_chat_token");
            if (saved) setPrevChatToken(saved);
        }
    });

    function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value.replace(/\D/g, "");
        let formatted = val;
        if (val.length > 3 && val.length <= 6) {
            formatted = `(${val.slice(0, 3)}) ${val.slice(3)}`;
        } else if (val.length > 6) {
            formatted = `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6, 10)}`;
        }
        setPhoneStr(formatted);
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("sending");

        const form = e.currentTarget;
        const data = new FormData(form);

        try {
            const res = await fetch("/api/catering", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    website: data.get("website"),
                    name: data.get("name"),
                    phone: data.get("phone"),
                    email: data.get("email"),
                    eventDate: data.get("date"),
                    guests: data.get("guests"),
                    location: data.get("location"),
                    notes: data.get("notes"),
                }),
            });

            if (res.ok) {
                const json = await res.json();
                setStatus("sent");
                form.reset();
                if (json.chatToken) {
                    localStorage.setItem("catering_chat_token", json.chatToken);
                    router.push(`/catering/chat/${json.chatToken}`);
                }
            } else {
                const json = await res.json().catch(() => ({}));
                setErrorMsg(json.error || "Something went wrong. Try again.");
                setStatus("error");
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Network error. Try again.");
            setStatus("error");
        }
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />

            <section className="section-shell">
                <div className="container-shell">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-bold">Catering</h1>
                        <p className="mt-3 text-gray-300">
                            Offices, birthdays, weddings, campus events. Share the details and we’ll reply fast.
                        </p>
                    </div>

                    {prevChatToken && (
                        <div className="mt-8 p-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-orange-50 text-sm">Resume Recent Discussion</p>
                                    <p className="text-orange-200/60 text-xs">You have an active quote discussion from this browser.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push(`/catering/chat/${prevChatToken}`)}
                                className="px-5 py-2 rounded-full bg-orange-500 text-black text-sm font-bold hover:bg-orange-400 transition shadow-lg shadow-orange-500/20 whitespace-nowrap"
                            >
                                Open Chat
                            </button>
                        </div>
                    )}

                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold">Request a quote</h2>

                            <form onSubmit={onSubmit} className="mt-6 space-y-4">
                                {/* Honeypot field for bot spam */}
                                <input
                                    type="text"
                                    name="website"
                                    className="hidden"
                                    aria-hidden="true"
                                    tabIndex={-1}
                                    autoComplete="off"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        name="name"
                                        required
                                        placeholder="Your name"
                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                                    />
                                    <input
                                        name="phone"
                                        required
                                        type="tel"
                                        value={phoneStr}
                                        onChange={handlePhoneChange}
                                        maxLength={14}
                                        placeholder="Phone number"
                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                                    />
                                </div>

                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Email"
                                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        name="date"
                                        type="date"
                                        required
                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30 text-white [&::-webkit-calendar-picker-indicator]:invert"
                                    />
                                    <input
                                        name="guests"
                                        placeholder="Guests (approx.)"
                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                                    />
                                </div>

                                <input
                                    name="location"
                                    placeholder="Event location"
                                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                                />

                                <textarea
                                    name="notes"
                                    placeholder="Tell us what you need (veg/non-veg, spice level, timing, budget)"
                                    rows={5}
                                    className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
                                />

                                <button
                                    disabled={status === "sending" || status === "sent"}
                                    className="w-full bg-orange-500 text-black px-6 py-3 rounded-full font-semibold hover:bg-orange-400 transition disabled:opacity-60"
                                >
                                    {status === "sending" ? "Sending..." : status === "sent" ? "Redirecting to Chat..." : "Send request"}
                                </button>

                                {status === "sent" && (
                                    <p className="text-green-300 text-sm">Sent! We’ll get back to you soon.</p>
                                )}
                                {status === "error" && (
                                    <p className="text-red-300 text-sm">{errorMsg}</p>
                                )}
                            </form>
                        </div>

                        <div className="card p-6">
                            <h2 className="text-xl font-semibold">Fast contact</h2>
                            <p className="mt-2 text-gray-300">
                                Need a quick answer? Call or text and we’ll respond.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <a
                                    href={`tel:${site.contact.phoneE164}`}
                                    className="bg-orange-500 text-black px-5 py-3 rounded-full font-semibold hover:bg-orange-400 transition"
                                >
                                    Call
                                </a>
                                <a
                                    href={`sms:${site.contact.phoneE164}`}
                                    className="border border-white/15 px-5 py-3 rounded-full hover:border-white/40 transition bg-white/5"
                                >
                                    Message
                                </a>
                            </div>

                            <div className="mt-10 text-sm text-gray-400">
                                Replace the phone number later in one config file (we’ll add that next).
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
