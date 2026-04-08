"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSite } from "@/components/SiteProvider";
import { isWellRecognizedEmail, EMAIL_DOMAIN_ERROR } from "@/lib/validation";
import { normalizePhone } from "@/lib/utils/phone";

export default function CartDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { items, updateQuantity, updateNotes, removeFromCart, clearCart, totalCents } = useCart();
    const { data: session } = useSession();
    const site = useSite();

    const truckStatus = site.truck.today.status;
    const isTruckOpen = truckStatus === "SERVING" || truckStatus === "CLOSING_SOON";

    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        email: "",
        phone: "",
        notes: "", // Order-level notes
    });

    const [editingNotes, setEditingNotes] = useState<string | null>(null);

    const [fieldErrors, setFieldErrors] = useState({ name: "", email: "", phone: "" });
    const [checkoutError, setCheckoutError] = useState("");

    // ... (useEffect for session stays same) ...
    useEffect(() => {
        if (session?.user) {
            setCustomerInfo(prev => ({
                ...prev,
                name: session.user?.name || prev.name,
                email: session.user?.email || prev.email,
            }));
        }
    }, [session]);

    useEffect(() => {
        const handleOpen = (e: Event) => {
            setIsOpen(true);
            const customEvent = e as CustomEvent<{ notes?: string }>;
            if (customEvent.detail?.notes) {
                setCustomerInfo(prev => ({ ...prev, notes: customEvent.detail.notes! }));
            }
        };
        window.addEventListener("open-cart", handleOpen);
        return () => window.removeEventListener("open-cart", handleOpen);
    }, []);

    const cartCount = items.reduce((acc: number, i: CartItem) => acc + i.quantity, 0);

    const handleChange = (field: keyof typeof customerInfo, value: string) => {
        setCustomerInfo(prev => ({ ...prev, [field]: value }));
        if (fieldErrors[field as keyof typeof fieldErrors]) setFieldErrors(prev => ({ ...prev, [field as keyof typeof fieldErrors]: "" }));
        if (checkoutError) setCheckoutError("");
    };

    const validate = (): boolean => {
        const errors = { name: "", email: "", phone: "" };
        let valid = true;

        if (!customerInfo.name.trim()) {
            errors.name = "Full name is required";
            valid = false;
        }
        if (!customerInfo.email.trim()) {
            errors.email = "Email address is required";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
            errors.email = "Please enter a valid email";
            valid = false;
        } else if (!isWellRecognizedEmail(customerInfo.email)) {
            errors.email = EMAIL_DOMAIN_ERROR;
            valid = false;
        }
        const phoneDigits = customerInfo.phone.replace(/\D/g, "");
        if (!customerInfo.phone.trim()) {
            errors.phone = "Phone number is required";
            valid = false;
        } else if (phoneDigits.length < 10) {
            errors.phone = "Please enter a valid 10-digit phone number";
            valid = false;
        }

        setFieldErrors(errors);
        return valid;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden"
                    />

                    <div className="fixed inset-y-0 right-0 flex max-w-full">
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-screen max-w-md bg-[#0b0b0b] border-l border-white/10 shadow-2xl print:hidden"
                        >
                            <div className="flex h-full flex-col">
                                <div className="flex items-center justify-between p-6 border-b border-white/10">
                                    <h2 className="text-xl font-bold italic tracking-tighter uppercase">Your Order ({cartCount})</h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 text-gray-400 hover:text-white transition"
                                        title="Close"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 scrollbars-none">
                                    {items.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                            <div className="text-6xl">🛒</div>
                                            <p className="font-bold uppercase tracking-widest text-[10px]">Your cart is empty</p>
                                            <button
                                                onClick={() => setIsOpen(false)}
                                                className="text-orange-500 font-black uppercase tracking-widest text-[10px] hover:underline"
                                            >
                                                Go back to menu
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex flex-col gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-sm tracking-tight">{item.name}</h3>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                                ${(item.priceCents / 100).toFixed(2)} each
                                                            </p>
                                                            {item.addons && item.addons.length > 0 && (
                                                                <div className="mt-1 flex flex-col gap-0.5">
                                                                    {item.addons.map(addon => (
                                                                        <span key={addon.id} className="text-[9px] font-black uppercase tracking-widest text-orange-400">
                                                                            + {addon.name} (${(addon.priceCents / 100).toFixed(2)})
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <button 
                                                                onClick={() => setEditingNotes(editingNotes === item.id ? null : item.id)}
                                                                className={`text-[9px] font-black uppercase tracking-widest mt-2 transition-colors ${item.notes ? 'text-orange-500' : 'text-gray-600 hover:text-gray-400'}`}
                                                            >
                                                                {item.notes ? '✓ Instruction Added' : '+ Add Instruction'}
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-black/40">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="px-3 py-1 hover:bg-white/5 transition text-gray-400 font-bold"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="px-3 py-1 bg-white/5 font-black text-xs min-w-[2rem] text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="px-3 py-1 hover:bg-white/5 transition text-gray-400 font-bold"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 w-20">
                                                            <p className="font-black italic tracking-tighter text-orange-500">
                                                                ${(((item.priceCents + (item.addons?.reduce((sum, a) => sum + a.priceCents, 0) || 0)) * item.quantity) / 100).toFixed(2)}
                                                            </p>
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="text-gray-600 hover:text-red-500 transition-colors p-1"
                                                                title="Remove item"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    {editingNotes === item.id && (
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <textarea
                                                                autoFocus
                                                                placeholder="Extra spicy, no onions, etc."
                                                                value={item.notes || ""}
                                                                onChange={(e) => updateNotes(item.id, e.target.value)}
                                                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-orange-500/30 transition placeholder:text-gray-800 resize-none h-20"
                                                            />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {items.length > 0 && (
                                    <div className="p-8 space-y-6 bg-white/5 border-t border-white/10 backdrop-blur-3xl">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 italic">Chef&apos;s Information</h4>
                                                {!session?.user && (
                                                    <Link href="/login" onClick={() => setIsOpen(false)} className="text-[9px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 underline underline-offset-4">
                                                        Login for 1-tap checkout
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {/* Name */}
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-sm outline-none transition placeholder:text-gray-700 ${
                                                            fieldErrors.name
                                                                ? "border-red-500/70 focus:border-red-500"
                                                                : "border-white/10 focus:border-orange-500/50"
                                                        }`}
                                                        value={customerInfo.name}
                                                        onChange={(e) => handleChange("name", e.target.value)}
                                                    />
                                                    {fieldErrors.name && (
                                                        <p className="mt-1 text-[11px] text-red-400 font-medium flex items-center gap-1">
                                                            <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            {fieldErrors.name}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    {/* Email */}
                                                    <div>
                                                        <input
                                                            type="email"
                                                            placeholder="Email Address"
                                                            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-sm outline-none transition placeholder:text-gray-700 ${
                                                                fieldErrors.email
                                                                    ? "border-red-500/70 focus:border-red-500"
                                                                    : "border-white/10 focus:border-orange-500/50"
                                                            }`}
                                                            value={customerInfo.email}
                                                            onChange={(e) => handleChange("email", e.target.value)}
                                                        />
                                                        {fieldErrors.email && (
                                                            <p className="mt-1 text-[11px] text-red-400 font-medium flex items-center gap-1 leading-tight">
                                                                {fieldErrors.email}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Phone */}
                                                    <div>
                                                        <input
                                                            type="tel"
                                                            placeholder="Phone Number"
                                                            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-sm outline-none transition placeholder:text-gray-700 ${
                                                                fieldErrors.phone
                                                                    ? "border-red-500/70 focus:border-red-500"
                                                                    : "border-white/10 focus:border-orange-500/50"
                                                            }`}
                                                            value={customerInfo.phone}
                                                            onChange={(e) => handleChange("phone", e.target.value)}
                                                        />
                                                        {fieldErrors.phone && (
                                                            <p className="mt-1 text-[11px] text-red-400 font-medium flex items-center gap-1 leading-tight">
                                                                {fieldErrors.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Order Notes (Allergies/Special Requests) */}
                                                <div>
                                                    <textarea
                                                        placeholder="Special Instructions / Allergies (Optional)"
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-orange-500/50 transition placeholder:text-gray-700 resize-none h-20"
                                                        value={customerInfo.notes}
                                                        onChange={(e) => handleChange("notes", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Amount</span>
                                            <span className="text-3xl font-black italic tracking-tighter text-orange-500 shadow-orange-500/10 shadow-2xl">
                                                ${(totalCents / 100).toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Checkout error banner */}
                                        {checkoutError && (
                                            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                                                <svg className="h-4 w-4 text-red-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-[12px] text-red-400 font-medium leading-relaxed">{checkoutError}</p>
                                            </div>
                                        )}

                                        {/* Truck closed banner */}
                                        {!isTruckOpen && (
                                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                                                <span className="text-xl">🕐</span>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-300">
                                                        {truckStatus === "SOLD_OUT" ? "Sold Out Today" :
                                                         truckStatus === "WEATHER_DELAY" ? "Weather Delay" :
                                                         truckStatus === "OPENING_SOON" ? "Opening Soon" :
                                                         "Truck is Closed"}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                                        Orders accepted during serving hours only
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.15em] hover:bg-orange-500 transition shadow-[0_12px_40px_rgba(249,115,22,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                            disabled={isSubmitting || items.length === 0 || !isTruckOpen}
                                            onClick={async () => {
                                                if (!validate()) return;

                                                setIsSubmitting(true);
                                                setCheckoutError("");
                                                try {
                                                    const res = await fetch("/api/orders", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            customerName: customerInfo.name,
                                                            customerEmail: customerInfo.email,
                                                            customerPhone: normalizePhone(customerInfo.phone),
                                                            notes: customerInfo.notes,
                                                            items,
                                                        }),
                                                    });

                                                    if (!res.ok) {
                                                        const data = await res.json();
                                                        throw new Error(data.error || "Order failed");
                                                    }

                                                    const data = await res.json();
                                                    if (data.clientSecret) {
                                                        const params = new URLSearchParams({
                                                            clientSecret: data.clientSecret,
                                                            orderId: data.orderId,
                                                            amount: String(data.totalAmount ?? totalCents),
                                                            subtotal: String(data.subtotalAmount ?? totalCents),
                                                            tax: String(data.taxAmount ?? 0),
                                                        });
                                                        clearCart();
                                                        window.location.href = `/checkout?${params.toString()}`;
                                                    } else {
                                                        throw new Error("Missing client secret");
                                                    }
                                                } catch (err: unknown) {
                                                    console.error("Checkout error", err);
                                                    const rawMsg = err instanceof Error ? err.message : "An error occurred during checkout";
                                                    setCheckoutError(rawMsg.length > 150 ? rawMsg.slice(0, 150) + "…" : rawMsg);
                                                    setIsSubmitting(false);
                                                }
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-3">
                                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Authenticating...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    Checkout Now
                                                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
