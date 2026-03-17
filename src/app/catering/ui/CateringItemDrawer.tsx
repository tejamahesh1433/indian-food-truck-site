"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CateringItem, SelectedItem } from "./types";
import { priceLabel } from "@/lib/utils/priceLabel";

interface Props {
    item: CateringItem | null;
    isOpen: boolean;
    onClose: () => void;
    onAdd: (selection: SelectedItem) => void;
}

export default function CateringItemDrawer({ item, isOpen, onClose, onAdd }: Props) {
    return (
        <AnimatePresence>
            {isOpen && item && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-[#0a0a0a] border-l border-white/5 shadow-2xl flex flex-col"
                    >
                        <DrawerContent 
                            key={item.id} 
                            item={item} 
                            onClose={onClose} 
                            onAdd={onAdd} 
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function DrawerContent({ item, onClose, onAdd }: { item: CateringItem; onClose: () => void; onAdd: (selection: SelectedItem) => void }) {
    const [quantity, setQuantity] = useState(() => {
        if (item.price.kind === "PER_PERSON") {
            return item.price.minPeople || 20;
        }
        return 1;
    });

    const [options, setOptions] = useState<{ [key: string]: string | number }>(() => {
        const defaultOptions: { [key: string]: string | number } = {};

        if (item.price.kind === "TRAY") {
            defaultOptions["Size"] = item.price.half ? "Half Tray" : "Full Tray";
        }

        if (item.badges?.includes("SPICY") || item.name.toLowerCase().includes("curry") || item.name.toLowerCase().includes("biryani")) {
            defaultOptions["Spice Level"] = "Medium";
        }

        if (item.price.kind === "PER_PERSON") {
            defaultOptions["Preference"] = "Mixed (Veg & Non-Veg)";
        }

        return defaultOptions;
    });

    const isPackage = item.price.kind === "PER_PERSON";
    const isTray = item.price.kind === "TRAY";

    function handleAdd() {
        const label = priceLabel(item.price, { selectedSize: options["Size"] as string });

        let pricePerUnit = 0;
        if (item.price.kind === "PER_PERSON") {
            pricePerUnit = item.price.amount;
        } else if (item.price.kind === "TRAY") {
            if (options["Size"] === "Half Tray") pricePerUnit = item.price.half || 0;
            else if (options["Size"] === "Full Tray") pricePerUnit = item.price.full || 0;
        } else if (item.price.kind === "FIXED") {
            pricePerUnit = item.price.amount;
        }

        onAdd({
            id: item.id,
            internalId: Math.random().toString(36).substring(7),
            name: item.name,
            quantity,
            options,
            priceLabel: label,
            pricePerUnit,
        });
        onClose();
    }

    return (
        <>
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Customize Item</h2>
                <button
                    onClick={onClose}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                    title="Close"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                    <h3 className="text-2xl font-black text-white mb-2">{item.name}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
                </div>

                {/* Options */}
                <div className="space-y-6">
                    {/* Tray Size Selection */}
                    {isTray && item.price.kind === "TRAY" && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-orange-500/80">Select Size</label>
                            <div className="grid grid-cols-2 gap-3">
                                {item.price.half && (
                                    <button
                                        onClick={() => setOptions({ ...options, Size: "Half Tray" })}
                                        className={`p-4 rounded-2xl border text-sm font-bold transition-all ${options["Size"] === "Half Tray" ? "border-orange-500 bg-orange-500/10 text-white" : "border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/[0.04]"}`}
                                    >
                                        <div className="text-xs opacity-50 mb-1 leading-none uppercase tracking-tighter">Half Tray</div>
                                        <div>${item.price.half}</div>
                                    </button>
                                )}
                                {item.price.full && (
                                    <button
                                        onClick={() => setOptions({ ...options, Size: "Full Tray" })}
                                        className={`p-4 rounded-2xl border text-sm font-bold transition-all ${options["Size"] === "Full Tray" ? "border-orange-500 bg-orange-500/10 text-white" : "border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/[0.04]"}`}
                                    >
                                        <div className="text-xs opacity-50 mb-1 leading-none uppercase tracking-tighter">Full Tray</div>
                                        <div>${item.price.full}</div>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Preference Selection for Packages */}
                    {isPackage && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-orange-500/80">Preferences</label>
                            <div className="grid grid-cols-1 gap-2">
                                {["Veg Only", "Mixed (Veg & Non-Veg)", "Non-Veg Focus"].map((pref) => (
                                    <button
                                        key={pref}
                                        onClick={() => setOptions({ ...options, Preference: pref })}
                                        className={`w-full p-4 rounded-2xl border text-left text-sm font-bold transition-all ${options["Preference"] === pref ? "border-orange-500 bg-orange-500/10 text-white" : "border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/[0.04]"}`}
                                    >
                                        {pref}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Spice Level */}
                    {options["Spice Level"] !== undefined && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-orange-500/80">Spice Level</label>
                            <div className="flex gap-2">
                                {["Mild", "Medium", "Hot"].map((spice) => (
                                    <button
                                        key={spice}
                                        onClick={() => setOptions({ ...options, "Spice Level": spice })}
                                        className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${options["Spice Level"] === spice ? "border-orange-500 bg-orange-500/10 text-white" : "border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/[0.04]"}`}
                                    >
                                        {spice}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-orange-500/80">
                            {isPackage ? "Number of Guests" : "Quantity"}
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center rounded-2xl border border-white/5 bg-white/[0.02] p-1">
                                <button
                                    onClick={() => setQuantity(Math.max(isPackage && item.price.kind === "PER_PERSON" ? (item.price.minPeople || 20) : 1, quantity - 1))}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-white transition-colors"
                                >
                                    -
                                </button>
                                <div className="w-16 text-center font-bold text-white text-lg">{quantity}</div>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-white transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            {isPackage && item.price.kind === "PER_PERSON" && <span className="text-xs text-white/40 font-medium">Min {item.price.minPeople || 20} guests</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                <button
                    onClick={handleAdd}
                    className="w-full h-16 rounded-2xl bg-orange-500 text-black font-black uppercase tracking-widest text-sm hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20"
                >
                    Add Selection to Request
                </button>
            </div>
        </>
    );
}
