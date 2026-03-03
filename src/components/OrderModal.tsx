"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { site } from "@/config/site";

export default function OrderModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
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
                                <div className="inline-flex items-center gap-2 pill">
                                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                                    Ordering
                                </div>
                                <h3 className="mt-3 text-2xl md:text-3xl font-bold">
                                    Online ordering is coming soon
                                </h3>
                                <p className="mt-2 text-gray-300">
                                    For now, you can call or text to place an order. We’ll also post specials on Instagram.
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-gray-200 hover:border-white/40 transition"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <a
                                href={`tel:${site.contact.phoneE164}`}
                                className="bg-orange-500 text-black px-5 py-3 rounded-full font-semibold hover:bg-orange-400 transition text-center"
                            >
                                Call to Order
                            </a>

                            <a
                                href={`sms:${site.contact.phoneE164}`}
                                className="border border-white/15 bg-white/5 px-5 py-3 rounded-full hover:border-white/40 transition text-center"
                            >
                                Text Order
                            </a>

                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(
                                    site.truck.today.mapsQuery
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="border border-white/15 bg-white/5 px-5 py-3 rounded-full hover:border-white/40 transition text-center"
                            >
                                Directions
                            </a>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Link
                                href="/menu"
                                className="border border-white/15 bg-white/5 px-5 py-3 rounded-full hover:border-white/40 transition text-center"
                                onClick={onClose}
                            >
                                View Menu
                            </Link>

                            <Link
                                href="/catering"
                                className="border border-white/15 bg-white/5 px-5 py-3 rounded-full hover:border-white/40 transition text-center"
                                onClick={onClose}
                            >
                                Catering
                            </Link>
                        </div>

                        <p className="mt-6 text-sm text-gray-400">
                            Tip: Once you choose Square/Toast later, we’ll replace this modal with a real “Order Online” link without redesigning the UI.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
