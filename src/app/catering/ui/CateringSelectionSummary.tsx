"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SelectedItem } from "./types";

interface Props {
    items: SelectedItem[];
    onRemove: (internalId: string) => void;
}

export default function CateringSelectionSummary({ items, onRemove }: Props) {
    if (items.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 border-orange-500/20 bg-orange-500/[0.02]"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Your Selection</h2>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded-md bg-orange-500 text-black uppercase tracking-widest">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                </span>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.internalId}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group flex flex-col gap-2 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white tracking-tight">{item.name}</h3>
                                        <span className="text-[10px] font-black text-orange-500/60 uppercase tracking-tighter">
                                            Qty {item.quantity}
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-white/40 leading-relaxed uppercase tracking-wide">
                                        {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(" • ")}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-xs font-black text-orange-500">{item.priceLabel}</span>
                                    <button
                                        onClick={() => onRemove(item.internalId)}
                                        className="p-2 -mr-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                <span>Summary auto-added to form below</span>
                <span className="text-orange-500/40">Scroll to continue</span>
            </div>
        </motion.div>
    );
}
