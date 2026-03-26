"use client";

import Navbar from "@/components/Navbar";
import { useState, useCallback } from "react";
import { isWellRecognizedEmail, EMAIL_DOMAIN_ERROR } from "@/lib/validation";
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

    // Selection State
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [drawerItem, setDrawerItem] = useState<CateringItem | null>(null);
    const [notes, setNotes] = useState("");

    const prefix = "Selected Catering Items:\n";
    const separator = "\n\nAdditional Notes:\n";

    const syncNotes = useCallback((items: SelectedItem[], prevNotes: string) => {
        const summary = items.length > 0
            ? items.map((item, idx) => {
                const opts = Object.entries(item.options)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" | ");
                return `${idx + 1}. ${item.name} — ${opts} — Qty ${item.quantity}`;
            }).join("\n")
            : "";

        let existingManualNotes = "";
        if (prevNotes.includes(separator)) {
            existingManualNotes = prevNotes.split(separator)[1] || "";
        } else if (prevNotes.startsWith(prefix)) {
            existingManualNotes = "";
        } else {
            existingManualNotes = prevNotes;
        }

        if (!summary) return existingManualNotes;
        return existingManualNotes
            ? `${prefix}${summary}${separator}${existingManualNotes}`
            : `${prefix}${summary}`;
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
        const email = data.get("email") as string;

        if (!isWellRecognizedEmail(email)) {
            setErrorMsg(EMAIL_DOMAIN_ERROR);
            setStatus("error");
            return;
        }

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
                    router.push(`/catering/chat/${json.chatToken}`);
                }
            } else {
                const json = await res.json().catch(() => ({}));
                setErrorMsg(json.error || "Something went wrong. Try again.");
                setStatus("error");
            }
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Network error. Try again.");
            setStatus("error");
        }
    }

    function addSelection(selection: SelectedItem) {
        const newItems = [...selectedItems, selection];
        setSelectedItems(newItems);
        setNotes(prev => syncNotes(newItems, prev));
    }

    function removeSelection(internalId: string) {
        const newItems = selectedItems.filter(s => s.internalId !== internalId);
        setSelectedItems(newItems);
        setNotes(prev => syncNotes(newItems, prev));
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-orange-500/30 pb-32 md:pb-0">
            <Navbar />

            <section className="section-shell">
                <div className="container-shell">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Catering</h1>
                        <p className="mt-4 text-gray-400 font-medium">
                            Offices, birthdays, weddings, campus events. Build your request below and we’ll reply fast.
                        </p>
                    </div>



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
                                            aria-label="Your name"
                                            title="Your name"
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
                                            aria-label="Phone number"
                                            title="Phone number"
                                            placeholder="Phone number"
                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 outline-none focus:border-orange-500/50 transition-colors"
                                        />
                                    </div>

                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        aria-label="Email address"
                                        title="Email address"
                                        placeholder="Email address"
                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 outline-none focus:border-orange-500/50 transition-colors"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <input
                                            name="date"
                                            type="text"
                                            placeholder="Event date"
                                            onFocus={(e) => {
                                                e.target.type = "date";
                                                e.target.min = new Date().toISOString().split("T")[0];
                                            }}
                                            onBlur={(e) => {
                                                if (!e.target.value) e.target.type = "text";
                                            }}
                                            required
                                            aria-label="Event date"
                                            title="Event date"
                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 outline-none focus:border-orange-500/50 text-white [&::-webkit-calendar-picker-indicator]:invert transition-colors"
                                        />
                                        <input
                                            name="guests"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            placeholder="Number of guests"
                                            onChange={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                            }}
                                            aria-label="Number of guests"
                                            title="Number of guests"
                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 outline-none focus:border-orange-500/50 transition-colors"
                                        />
                                    </div>

                                    <input
                                        name="location"
                                        aria-label="Event location / address"
                                        title="Event location / address"
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
