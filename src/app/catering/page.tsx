"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { site } from "@/config/site";

export default function CateringPage() {
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("sending");

        const form = e.currentTarget;
        const data = new FormData(form);

        try {
            const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
                method: "POST",
                body: data,
                headers: { Accept: "application/json" },
            });

            if (res.ok) {
                setStatus("sent");
                form.reset();
            } else {
                setStatus("error");
            }
        } catch {
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

                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card p-6">
                            <h2 className="text-xl font-semibold">Request a quote</h2>

                            <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
                                        placeholder="Event date"
                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
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
                                    disabled={status === "sending"}
                                    className="w-full bg-orange-500 text-black px-6 py-3 rounded-full font-semibold hover:bg-orange-400 transition disabled:opacity-60"
                                >
                                    {status === "sending" ? "Sending..." : "Send request"}
                                </button>

                                {status === "sent" && (
                                    <p className="text-green-300 text-sm">Sent! We’ll get back to you soon.</p>
                                )}
                                {status === "error" && (
                                    <p className="text-red-300 text-sm">Something went wrong. Try again.</p>
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
