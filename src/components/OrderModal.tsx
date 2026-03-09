"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSite } from "@/components/SiteProvider";

export default function OrderModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const site = useSite();

    const openCart = () => {
        onClose();
        window.dispatchEvent(new CustomEvent("open-cart"));
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 md:p-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Panel */}
                    <motion.div
                        className="relative w-full md:max-w-xl mx-auto rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8 shadow-[0_40px_200px_rgba(0,0,0,0.65)]"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-bold text-green-400 uppercase tracking-widest">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    Now Live
                                </div>
                                <h3 className="mt-3 text-2xl md:text-3xl font-bold">
                                    Online Ordering is Live!
                                </h3>
                                <p className="mt-2 text-gray-300">
                                    You can now place your order directly through our website. Pay securely with Stripe and pick up at the truck!
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="rounded-full border border-white/15 bg-white/5 p-2 text-gray-200 hover:border-white/40 transition"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-8 space-y-4">
                            <Link
                                href="/menu"
                                onClick={onClose}
                                className="block w-full bg-orange-500 text-black py-4 rounded-2xl font-bold text-center hover:bg-orange-400 transition shadow-[0_12px_40px_rgba(255,140,0,0.22)]"
                            >
                                Browse Menu & Order
                            </Link>

                            <div className="grid grid-cols-2 gap-3">
                                <a
                                    href={`tel:${site.contact.phoneE164}`}
                                    className="border border-white/10 bg-white/5 py-3 rounded-xl hover:bg-white/10 transition text-center text-sm font-medium"
                                >
                                    Call to Order
                                </a>
                                <a
                                    href={`sms:${site.contact.phoneE164}`}
                                    className="border border-white/10 bg-white/5 py-3 rounded-xl hover:bg-white/10 transition text-center text-sm font-medium"
                                >
                                    Text Order
                                </a>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-xs text-center text-gray-500 uppercase tracking-widest font-bold">
                                Quick Links
                            </p>
                            <div className="mt-4 flex justify-center gap-6">
                                <Link href="/catering" className="text-sm text-gray-400 hover:text-orange-500 transition" onClick={onClose}>Catering</Link>
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(site.truck.today.mapsQuery)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-gray-400 hover:text-orange-500 transition"
                                >
                                    Directions
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
