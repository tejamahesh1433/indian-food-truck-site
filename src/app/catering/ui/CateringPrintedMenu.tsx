"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSite } from "@/components/SiteProvider";
import { Badge, Price, CateringItem, CateringSection } from "./types";
import { motion, AnimatePresence } from "framer-motion";

function money(n: number) {
    return `$${n.toFixed(0)}`;
}

function priceLabel(p: Price) {
    if (p.kind === "PER_PERSON") {
        return (
            <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-orange-500">{money(p.amount)}</span>
                <span className="text-[10px] uppercase tracking-tighter text-white/40">per person</span>
                {p.minPeople ? <span className="text-[9px] text-orange-500/60 font-medium">{p.minPeople}+ Guests</span> : null}
            </div>
        );
    }
    if (p.kind === "TRAY") {
        return (
            <div className="flex gap-4">
                {p.half && (
                    <div className="flex flex-col items-end border-r border-white/10 pr-4">
                        <span className="text-lg font-bold text-orange-500">{money(p.half)}</span>
                        <span className="text-[10px] uppercase tracking-tighter text-white/40">half tray</span>
                    </div>
                )}
                {p.full && (
                    <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-orange-500">{money(p.full)}</span>
                        <span className="text-[10px] uppercase tracking-tighter text-white/40">full tray</span>
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-orange-500">{money(p.amount)}</span>
            <span className="text-[10px] uppercase tracking-tighter text-white/40">{p.unit ? `per ${p.unit}` : ""}</span>
        </div>
    );
}

function badgeChip(b: Badge) {
    const config = {
        VEG: { label: "Veg", color: "text-green-400 bg-green-400/10 border-green-400/20" },
        SPICY: { label: "Spicy", color: "text-red-400 bg-red-400/10 border-red-400/20" },
        POPULAR: { label: "Popular", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
        NUTS: { label: "Contains Nuts", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    };
    const { label, color } = config[b] || config.POPULAR;
    return (
        <span
            key={b}
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${color}`}
        >
            {label}
        </span>
    );
}

function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function CateringPrintedMenu({
    onSelectItem
}: {
    onSelectItem?: (item: CateringItem) => void
}) {
    const site = useSite();
    const [sections, setSections] = useState<CateringSection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMenu() {
            try {
                const res = await fetch("/api/catering-menu");
                const data = await res.json();
                if (data.ok) {
                    setSections(data.sections || []);
                }
            } catch (err) {
                console.error("Failed to fetch catering menu", err);
            } finally {
                setLoading(false);
            }
        }
        fetchMenu();
    }, []);

    const firstTab = sections.length > 0 ? slugify(sections[0].title) : "";
    const [activeTab, setActiveTab] = useState<string>("");

    useEffect(() => {
        if (!activeTab && firstTab) {
            setActiveTab(firstTab);
        }
    }, [firstTab, activeTab]);

    const activeSection = useMemo(() => {
        const found = sections.find((s) => slugify(s.title) === activeTab);
        return found ?? sections[0];
    }, [activeTab, sections]);

    function renderSection(section: CateringSection | undefined, isPrint = false) {
        if (!section) return null;
        return (
            <motion.div
                key={section.title}
                initial={isPrint ? {} : { opacity: 0, y: 20 }}
                animate={isPrint ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`mb-12 last:mb-0 ${isPrint ? "" : "pointer-events-auto"}`}
            >
                <div className="mb-8 flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-orange-500/80 mb-2">
                        Catalogue
                    </span>
                    <h2 className={`text-3xl font-black tracking-tight ${isPrint ? "text-black" : "text-white"}`}>
                        {section.title}
                    </h2>
                    {section.subtitle && (
                        <p className={`mt-2 text-sm max-w-md ${isPrint ? "text-gray-600" : "text-white/50"}`}>
                            {section.subtitle}
                        </p>
                    )}
                    <div className="mt-6 h-px w-24 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                    {section.items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={isPrint ? {} : { opacity: 0, x: -10 }}
                            animate={isPrint ? {} : { opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${isPrint ? "border-black/5 bg-white p-4" : "border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/10"}`}
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className={`text-lg font-bold ${isPrint ? "text-black" : "text-white group-hover:text-orange-400 transition-colors"}`}>
                                                {item.name}
                                            </h3>
                                            <div className="flex gap-1">
                                                {item.badges?.map(badgeChip)}
                                            </div>
                                        </div>
                                        {item.description && (
                                            <p className={`text-sm leading-relaxed ${isPrint ? "text-gray-600" : "text-white/40 group-hover:text-white/60 transition-colors"}`}>
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="shrink-0 mt-1">
                                        {priceLabel(item.price)}
                                    </div>
                                </div>

                                {!isPrint && onSelectItem && (
                                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-end">
                                        <button
                                            onClick={() => onSelectItem(item)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-orange-500/10 px-4 py-2 text-xs font-black text-orange-500 hover:bg-orange-500 hover:text-black transition-all"
                                        >
                                            <span className="text-[14px]">+</span>
                                            ADD TO REQUEST
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        );
    }

    return (
        <section className="relative mt-12 mb-24 overflow-hidden py-12 print:m-0 print:p-0">
            {/* Background Aesthetics */}
            <div className="absolute inset-0 -z-10 bg-[#050505] mix-blend-multiply print:hidden" />
            <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-[120px] print:hidden" />
            <div className="absolute bottom-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px] print:hidden" />

            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-12 overflow-hidden rounded-3xl border border-white/5 bg-white/[0.01] shadow-2xl backdrop-blur-xl print:border-none print:bg-white">
                    {/* Header */}
                    <div className="relative border-b border-white/5 px-8 py-10 md:px-12 print:border-black/10">
                        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-3 py-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Professional Catering</span>
                                </div>
                                <div>
                                    <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl print:text-black">
                                        The <span className="text-orange-500">Catering</span> Menu
                                    </h1>
                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/40 print:text-gray-500">
                                        <span className="text-white/60 print:text-gray-500">{site.brand.city}</span>
                                        <span className="h-1 w-1 rounded-full bg-white/20 print:bg-gray-400" />
                                        <span className="text-orange-500/80">Premium Authentic Flavors</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 print:hidden">
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 rounded-2xl bg-white/5 px-6 py-4 text-sm font-black text-white hover:bg-white/10 transition-all border border-white/10 group"
                                >
                                    <svg className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-3a2 2 0 00-2-2H7a2 2 0 00-2 2v3a2 2 0 002 2zm0-10V4a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6" /></svg>
                                    SAVE MENU PDF
                                </button>
                                <a
                                    href="#request"
                                    className="rounded-2xl bg-orange-500 px-8 py-4 text-sm font-black text-black hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20"
                                >
                                    REQUEST QUOTE
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Nav Tabs - Hidden on print */}
                    <div className="print:hidden border-b border-white/5 px-8 pt-6 md:px-12">
                        <div className="flex flex-wrap gap-1 pb-6">
                            {sections.map((s) => {
                                const key = slugify(s.title);
                                const active = key === activeTab;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setActiveTab(key)}
                                        className={`relative rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all duration-300 ${active ? "text-white" : "text-white/30 hover:text-white/60 hover:bg-white/5"}`}
                                    >
                                        {s.title}
                                        {active && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-2 right-2 h-1 rounded-t-full bg-orange-500"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        {/* SCREEN VERSION */}
                        <div className="print:hidden">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-32 text-white/20">
                                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/5 border-t-orange-500 mb-4" />
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Preparing Flavors</span>
                                </div>
                            ) : (
                                <AnimatePresence mode="wait">
                                    {renderSection(activeSection)}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* PRINT VERSION */}
                        <div className="hidden print:block">
                            {sections.map((s) => renderSection(s, true))}

                            <div className="mt-20 border-t border-black/10 pt-10 text-center">
                                <p className="text-2xl font-black text-black mb-4">Ready to Order?</p>
                                <p className="text-sm font-bold text-gray-500">
                                    Call or Text {site.contact.phoneDisplay} • {site.brand.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Guard */}
                    <div className="border-t border-white/5 bg-white/[0.01] px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/20 md:px-12 print:border-black/10 print:bg-white print:text-gray-400">
                        © {new Date().getFullYear()} {site.brand.name} Catering Division
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    .absolute { display: none !important; }
                }
            `}</style>
        </section>
    );
}
