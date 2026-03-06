"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSite } from "@/components/SiteProvider";
import CateringPrintedMenu from "./ui/CateringPrintedMenu";
import { CateringItem, SelectedItem } from "./ui/types";
import CateringItemDrawer from "./ui/CateringItemDrawer";
import CateringSelectionSummary from "./ui/CateringSelectionSummary";

export default function CateringPage() {
    const site = useSite();
    const router = useRouter();
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [phoneStr, setPhoneStr] = useState("");
    const [prevChatToken, setPrevChatToken] = useState<string | null>(null);

    // Selection State
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [drawerItem, setDrawerItem] = useState<CateringItem | null>(null);
    const [notes, setNotes] = useState("");

    // Auto-fill notes from selections
    useEffect(() => {
        if (selectedItems.length > 0) {
            const summary = selectedItems.map((item, idx) => {
                const opts = Object.entries(item.options)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" | ");
                return `${idx + 1}. ${item.name} — ${opts} — Qty ${item.quantity}`;
            }).join("\n");

            setNotes((prev) => {
                const prefix = "Selected Catering Items:\n";
                const separator = "\n\nAdditional Notes:\n";

                if (!prev || prev.startsWith(prefix)) {
                    return `${prefix}${summary}`;
                }

                const parts = prev.split(separator);
                const existingNotes = parts.length > 1 ? parts[1] : prev;
                return `${prefix}${summary}${separator}${existingNotes}`;
            });
        }
    }, [selectedItems]);

    useEffect(() => {
        // Initial check for token
        const saved = localStorage.getItem("catering_chat_token");
        if (saved) setPrevChatToken(saved);
    }, []);

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
                    selections: selectedItems,
                }),
            });

            if (res.ok) {
                const json = await res.json();
                setStatus("sent");
                form.reset();
                setSelectedItems([]);
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

    function addSelection(selection: SelectedItem) {
        setSelectedItems([...selectedItems, selection]);
    }

    function removeSelection(internalId: string) {
        setSelectedItems(selectedItems.filter(s => s.internalId !== internalId));
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-orange-500/30">
            <Navbar />

            <section className="section-shell">
                <div className="container-shell">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Catering</h1>
                        <p className="mt-4 text-gray-400 font-medium">
                            Offices, birthdays, weddings, campus events. Build your request below and we’ll reply fast.
                        </p>
                    </div>

                    {prevChatToken && (
                        <div className="mt-8 p-4 rounded-3xl border border-orange-500/20 bg-orange-500/5 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-orange-50 text-sm">Resume Recent Discussion</p>
                                    <p className="text-orange-200/40 text-[11px] font-medium tracking-tight">You have an active quote discussion from this browser.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push(`/catering/chat/${prevChatToken}`)}
                                className="px-5 py-2 rounded-2xl bg-orange-500 text-black text-sm font-black hover:bg-orange-400 transition shadow-lg shadow-orange-500/20 whitespace-nowrap"
                            >
                                OPEN CHAT
                            </button>
                        </div>
                    )}

                    {!site.cateringEnabled && (
                        <div className="mt-8 p-6 rounded-3xl border border-red-500/20 bg-red-500/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 text-2xl">
                                ⏳
                            </div>
                            <div>
                                <p className="font-bold text-red-50 text-lg tracking-tight">Catering Currently Unavailable</p>
                                <p className="text-red-200/40 text-sm font-medium">We are not accepting new catering requests at this time. Please check back later or call us for urgent inquiries.</p>
                            </div>
                        </div>
                    )}

                    <CateringPrintedMenu onSelectItem={site.cateringEnabled ? setDrawerItem : undefined} />

                    <CateringItemDrawer
                        item={drawerItem}
                        isOpen={!!drawerItem}
                        onClose={() => setDrawerItem(null)}
                        onAdd={addSelection}
                    />

                    <div id="request" className="mt-20 flex flex-col gap-8">
                        <CateringSelectionSummary
                            items={selectedItems}
                            onRemove={removeSelection}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="card p-8 bg-white/[0.02] border-white/5 shadow-2xl">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Request a quote</h2>
                                <p className="mt-2 text-sm text-white/40 mb-8 font-medium">Fill out your details and we’ll build your customized package.</p>

                                <form onSubmit={onSubmit} className="space-y-5">
                                    {/* Honeypot field for bot spam */}
                                    <input type="text" name="website" className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <input
                                            name="name"
                                            required
                                            placeholder="Your name"
                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 outline-none focus:border-orange-500/50 transition-colors"
                                        />
                                        <input
                                            name="phone"
                                            required
                                            type="tel"
                                            value={phoneStr}
                                            onChange={handlePhoneChange}
                                            maxLength={14}
                                            placeholder="Phone number"
                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 outline-none focus:border-orange-500/50 transition-colors"
                                        />
                                    </div>

                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="Email address"
                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 outline-none focus:border-orange-500/50 transition-colors"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <input
                                            name="date"
                                            type="date"
                                            required
                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 outline-none focus:border-orange-500/50 text-white [&::-webkit-calendar-picker-indicator]:invert transition-colors"
                                        />
                                        <input
                                            name="guests"
                                            placeholder="Number of guests"
                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 outline-none focus:border-orange-500/50 transition-colors"
                                        />
                                    </div>

                                    <input
                                        name="location"
                                        placeholder="Event location / address"
                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 outline-none focus:border-orange-500/50 transition-colors"
                                    />

                                    <textarea
                                        name="notes"
                                        placeholder="Tell us more about your event..."
                                        rows={6}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 outline-none focus:border-orange-500/50 transition-colors resize-none"
                                    />

                                    <button
                                        disabled={status === "sending" || status === "sent"}
                                        className="w-full h-16 bg-orange-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-400 transition-all disabled:opacity-50 shadow-xl shadow-orange-500/20"
                                    >
                                        {status === "sending" ? "Sending Request..." : status === "sent" ? "Opening Discussion..." : "Submit Quote Request"}
                                    </button>

                                    {status === "sent" && (
                                        <p className="text-center text-orange-400 text-xs font-black uppercase tracking-widest mt-4">Success! Redirecting you now...</p>
                                    )}
                                    {status === "error" && (
                                        <p className="text-center text-red-400 text-xs font-black uppercase tracking-widest mt-4">{errorMsg}</p>
                                    )}
                                </form>
                            </div>

                            <div className="card p-8 bg-white/[0.02] border-white/5 shadow-2xl flex flex-col justify-between min-h-[400px]">
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Fast Contact</h2>
                                    <p className="mt-2 text-sm text-white/40 font-medium">Need immediate assistance? Reach out directly.</p>

                                    <div className="mt-10 flex flex-col gap-4">
                                        <a
                                            href={`tel:${site.contact.phoneE164}`}
                                            className="flex items-center justify-center h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
                                        >
                                            Call Us: {site.contact.phoneDisplay}
                                        </a>
                                        <a
                                            href={`sms:${site.contact.phoneE164}`}
                                            className="flex items-center justify-center h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 font-black uppercase tracking-widest text-sm hover:bg-orange-500 hover:text-black transition-all"
                                        >
                                            Send a Message
                                        </a>
                                    </div>
                                </div>

                                <div className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 leading-loose">
                                        Note: Final details including sales tax, delivery fees, and service charges will be calculated in your custom quote.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
