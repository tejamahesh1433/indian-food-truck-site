"use client";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import CustomCheckbox from "./ui/CustomCheckbox";
import { useCartAnimation } from "@/lib/cartAnimation";

export interface CustomizationAddon {
    id: string;
    name: string;
    priceCents: number;
    isAvailable: boolean;
}

export interface CustomizationMenuItem {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    imageUrl: string | null;
    addons?: CustomizationAddon[];
    isVeg?: boolean;
    isNonVeg?: boolean;
    isSpicy?: boolean;
    isPopular?: boolean;
    allergens?: string[];
    avgRating?: number;
    reviewCount?: number;
    reviews?: { text: string }[];
    prepTime?: string | null;
    category?: string;
}


interface ItemCustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: CustomizationMenuItem | null;
    onAdd: (payload: { quantity: number; notes: string; addons: CustomizationAddon[] }) => void;
    upsellItems?: CustomizationMenuItem[];
    onQuickAdd?: (item: CustomizationMenuItem, el: HTMLElement) => void;
}

export default function ItemCustomizationModal({ isOpen, onClose, item, onAdd, upsellItems = [], onQuickAdd }: ItemCustomizationModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [spiceLevel, setSpiceLevel] = useState<string>("");
    const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
    const [specialInstructions, setSpecialInstructions] = useState("");
    const confirmBtnRef = useRef<HTMLButtonElement>(null);
    const { flyToCart } = useCartAnimation();

    // Lock background scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);



    if (!isOpen || !item) return null;

    const availableAddons = item.addons?.filter(a => a.isAvailable) || [];
    
    // Calculates total cost of this item * quantity
    const runningTotal = (
        item.priceCents + 
        availableAddons.filter(a => selectedAddons.has(a.id)).reduce((acc: number, a: CustomizationAddon) => acc + a.priceCents, 0)
    ) * quantity;

    const isSpiceMissing = item.isSpicy && !spiceLevel;

    const cleanAddonName = (name: string) => {
        const cleaned = name
            .replace(/\(\d+\)/g, (match) => ` ${match.replace("(", "(").replace(")", " pcs)")}`)
            .trim();
        return cleaned.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const handleConfirm = () => {
        if (isSpiceMissing) return;

        if (confirmBtnRef.current) {
            flyToCart(item.imageUrl || "", confirmBtnRef.current);
        }

        const combinedNotes = [
            item.isSpicy ? `Spice Level: ${spiceLevel}` : "",
            specialInstructions.trim() ? `Instructions: ${specialInstructions.trim()}` : ""
        ].filter(Boolean).join(" | ");

        onAdd({
            quantity,
            notes: combinedNotes,
            addons: availableAddons.filter(a => selectedAddons.has(a.id)),
        });
        onClose();
    };

    const toggleAddon = (addonId: string) => {
        setSelectedAddons(prev => {
            const next = new Set(prev);
            if (next.has(addonId)) next.delete(addonId);
            else next.add(addonId);
            return next;
        });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                    onClick={onClose} 
                />
                
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-t-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-full sm:h-auto max-h-full sm:max-h-[92vh]"
                >
                    {/* Header Image with Heat-Haze Filter */}
                    <div className="relative h-40 sm:h-44 w-full shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                            <Image 
                                src={item.imageUrl} 
                                alt={item.name} 
                                fill 
                                className={`object-cover scale-110 hover:scale-100 transition-transform duration-700 ${spiceLevel === "Spicy" ? "spice-heat-haze" : ""}`} 
                            />
                        ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-500">
                                <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-black/20" />
                        
                        <button 
                            title="Close"
                            onClick={onClose}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-md transition"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* SVG Heat Haze Filter Definition */}
                    <svg className="hidden-svg">
                        <filter id="spice-heat">
                            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.05" numOctaves="2" seed="2">
                                <animate attributeName="seed" from="0" to="100" dur="10s" repeatCount="indefinite" />
                            </feTurbulence>
                            <feDisplacementMap in="SourceGraphic" scale="15" />
                        </filter>
                    </svg>

                    <style jsx global>{`
                        .spice-heat-haze {
                            filter: url(#spice-heat);
                        }
                    `}</style>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-2 hide-scrollbar">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-white">{item.name}</h2>
                            
                            {item.reviewCount! > 0 && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center text-yellow-400 font-bold text-sm">
                                        ⭐ {item.avgRating}
                                    </span>
                                    <span className="text-gray-400 text-sm underline decoration-white/20 underline-offset-4">
                                        ({item.reviewCount} reviews)
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5 text-gray-300 text-sm mt-3 font-medium">
                                <span>🕒</span>
                                <span>Ready in {item.prepTime || "15-20"} mins</span>
                            </div>

                            {item.description && <p className="text-gray-400 text-sm mt-3 leading-relaxed">{item.description}</p>}

                            {item.reviews && item.reviews.length > 0 && (
                                <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
                                    <div className="absolute top-1 left-2 text-4xl text-white/5 select-none font-serif">&quot;</div>
                                    <p className="text-gray-300 text-sm italic relative z-10 pl-1">
                                        &ldquo;{item.reviews[0].text}&rdquo;
                                    </p>
                                </div>
                            )}
                            
                            <div className="mt-4 flex flex-wrap gap-2 items-center">
                                {item.isVeg && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-500">Vegetarian</span>}
                                {item.isNonVeg && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500">Non-Veg</span>}
                                {item.isSpicy && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500">Spicy</span>}
                                {item.isPopular && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500">Popular</span>}
                                {item.allergens && item.allergens.map(a => (
                                    <span key={a} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-red-900/40 border border-red-500/30 text-red-300">Contains: {a}</span>
                                ))}
                            </div>

                            <div className="mt-4 text-orange-500 font-bold text-xl flex items-center gap-2">
                                <span>Total:</span>
                                <span>${(runningTotal / 100).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Spice Level Section */}
                        {item.isSpicy && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-3 border-b border-white/10 pb-2">
                                    Spice Level <span className="text-red-500 text-xs ml-1">*Required</span>
                                </h3>
                                <div className="flex gap-2">
                                    {["Mild", "Medium", "Spicy"].map(level => {
                                        const isSelected = spiceLevel === level;
                                        return (
                                            <label 
                                                key={level} 
                                                className={`flex-1 relative text-center py-3.5 rounded-2xl border transition-all duration-300 cursor-pointer font-bold text-sm overflow-hidden ${
                                                    isSelected 
                                                    ? "border-orange-500 bg-orange-500/20 text-white ring-1 ring-orange-500/50" 
                                                    : "border-white/5 bg-white/5 text-gray-500 hover:bg-white/10 hover:border-white/20"
                                                }`}
                                            >
                                                <input 
                                                    type="radio" 
                                                    className="hidden" 
                                                    name="spiceLevel" 
                                                    value={level} 
                                                    checked={isSelected} 
                                                    onChange={() => setSpiceLevel(level)} 
                                                />
                                                <div className="flex items-center justify-center gap-1.5 h-full">
                                                    {isSelected && (
                                                        <motion.svg 
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            className="w-4 h-4 text-orange-500" 
                                                            fill="currentColor" 
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </motion.svg>
                                                    )}
                                                    {level}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                                {isSpiceMissing && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center justify-center gap-1.5 mt-3 text-orange-500/90"
                                    >
                                        <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                                        <p className="text-[11px] font-bold uppercase tracking-wider">
                                            Select a spice level to continue
                                        </p>
                                        <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Addons Section */}
                        {availableAddons.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 border-b border-white/5 pb-2">
                                    Add-ons
                                </h3>
                                <div className="space-y-2.5">
                                    {availableAddons.map(addon => {
                                        const isSelected = selectedAddons.has(addon.id);
                                        // Clean label
                                        const cleanName = cleanAddonName(addon.name);
                                        
                                        return (
                                            <label 
                                                key={addon.id} 
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                                                    isSelected 
                                                    ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30" 
                                                    : "border-white/5 bg-white/5 hover:bg-white/8 hover:border-white/10"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CustomCheckbox 
                                                        checked={isSelected} 
                                                        onChange={() => toggleAddon(addon.id)} 
                                                    />
                                                    <span className={`font-semibold text-sm transition-colors ${isSelected ? "text-white" : "text-gray-300"}`}>{cleanName}</span>
                                                </div>
                                                <span className={`text-sm font-black transition-colors ${isSelected ? "text-orange-400" : "text-gray-500"}`}>
                                                    +${(addon.priceCents / 100).toFixed(2)}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Upsell Section - Grouped by Category */}
                        {upsellItems.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 border-b border-white/5 pb-2">
                                    Complete your meal
                                </h3>
                                <div className="space-y-6">
                                    {/* Group by category */}
                                    {Object.entries(
                                        upsellItems.reduce((acc, current) => {
                                            const cat = current.category || "Recommended";
                                            if (!acc[cat]) acc[cat] = [];
                                            acc[cat].push(current);
                                            return acc;
                                        }, {} as Record<string, CustomizationMenuItem[]>)
                                    ).map(([catName, catItems]) => (
                                        <div key={catName}>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 px-1">{catName}</div>
                                            <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar -mx-1 px-1">
                                                {catItems.filter(u => u.id !== item.id).map(u => (
                                                    <div
                                                        key={u.id}
                                                        className="flex-shrink-0 w-40 bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 hover:border-white/20 transition-all duration-300 group flex flex-col shadow-xl"
                                                    >
                                                        <div className="relative w-full aspect-[3/2] overflow-hidden">
                                                            {u.imageUrl ? (
                                                                <Image src={u.imageUrl} alt={u.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                            ) : (
                                                                <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-600">
                                                                    <svg className="w-6 h-6 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80" />
                                                            <div className="absolute bottom-2 left-3 text-white font-black text-xs drop-shadow-md">
                                                                ${(u.priceCents / 100).toFixed(2)}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="p-4 flex flex-col flex-1">
                                                            <div className="text-[12px] font-bold text-white leading-snug mb-4 line-clamp-1 group-hover:text-orange-400 transition-colors uppercase tracking-tight">{u.name}</div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onQuickAdd?.(u, e.currentTarget);
                                                                }}
                                                                className="mt-auto w-full py-2.5 bg-orange-600/90 hover:bg-orange-500 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg active:scale-95 border border-white/10"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                                                </svg>
                                                                Add
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Special Instructions */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-3 border-b border-white/10 pb-2">
                                Special Instructions <span className="text-gray-500 text-xs normal-case tracking-normal ml-1">(optional)</span>
                            </h3>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none outline-none shadow-inner"
                                placeholder="e.g., No onions, extra crispy, sauce on the side..."
                                rows={2}
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                            />
                        </div>

                        {/* Quantity Pill Control */}
                        <div className="mb-6 flex flex-col items-center">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                                Quantity
                            </h3>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 self-center shadow-lg">
                                <button
                                    title="Decrease quantity"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition active:scale-90"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                                    </svg>
                                </button>
                                <div className="w-16 text-center">
                                    <span className="text-2xl font-black text-white">{quantity}</span>
                                </div>
                                <button
                                    title="Increase quantity"
                                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition active:scale-90"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-white/5 shrink-0 bg-[#0A0A0A] space-y-4">
                        {/* Subtotal Breakdown */}
                        {!isSpiceMissing && (
                            <div className="flex justify-between items-end px-2">
                                <div className="text-xs text-gray-500 font-medium space-y-0.5">
                                    <div>{quantity} × ${(item.priceCents / 100).toFixed(2)} (Base)</div>
                                    {selectedAddons.size > 0 && (
                                        <div className="text-orange-500/70">+ ${(availableAddons.filter(a => selectedAddons.has(a.id)).reduce((acc: number, a: CustomizationAddon) => acc + a.priceCents, 0) / 100).toFixed(2)} Add-ons</div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">Subtotal</div>
                                    <div className="text-lg font-black text-white leading-none">${(runningTotal / 100).toFixed(2)}</div>
                                </div>
                            </div>
                        )}

                        <button
                            ref={confirmBtnRef}
                            onClick={handleConfirm}
                            disabled={!!isSpiceMissing}
                            className={`w-full text-white rounded-[1.5rem] py-4.5 font-black flex items-center justify-center gap-2 transition-all duration-300 shadow-xl active:scale-[0.97] ${
                                isSpiceMissing ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5" : "bg-orange-600 hover:bg-orange-550 shadow-orange-900/10"
                            }`}
                        >
                            <span className="text-base">
                                {isSpiceMissing ? "Select Spice Level" : `Add ${quantity} to Cart`}
                            </span>
                            {!isSpiceMissing && (
                                <>
                                    <span className="opacity-40 font-light mx-1">•</span>
                                    <span className="text-base">${(runningTotal / 100).toFixed(2)}</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
