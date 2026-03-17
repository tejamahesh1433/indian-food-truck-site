"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function CartDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { items, updateQuantity, removeFromCart, clearCart, totalCents } = useCart();
    const { data: session } = useSession();

    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        email: "",
        phone: "",
    });

    // Pre-fill from session
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
        const handleOpen = () => setIsOpen(true);
        window.addEventListener("open-cart", handleOpen);
        return () => window.removeEventListener("open-cart", handleOpen);
    }, []);

    const cartCount = items.reduce((acc: number, i: CartItem) => acc + i.quantity, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <div className="fixed inset-y-0 right-0 flex max-w-full">
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-screen max-w-md bg-[#0b0b0b] border-l border-white/10 shadow-2xl"
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

                                <div className="flex-1 overflow-y-auto p-6">
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
                                        <div className="space-y-6">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-sm tracking-tight">{item.name}</h3>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                            ${(item.priceCents / 100).toFixed(2)} each
                                                        </p>
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
                                                            ${((item.priceCents * item.quantity) / 100).toFixed(2)}
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
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition placeholder:text-gray-700"
                                                    value={customerInfo.name}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                />
                                                <input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition placeholder:text-gray-700"
                                                    value={customerInfo.email}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="Phone Number"
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-orange-500/50 outline-none transition placeholder:text-gray-700"
                                                    value={customerInfo.phone}
                                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Amount</span>
                                            <span className="text-3xl font-black italic tracking-tighter text-orange-500 shadow-orange-500/10 shadow-2xl">
                                                ${(totalCents / 100).toFixed(2)}
                                            </span>
                                        </div>

                                        <button
                                            className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.15em] hover:bg-orange-500 transition shadow-[0_12px_40px_rgba(249,115,22,0.25)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                            disabled={isSubmitting || items.length === 0}
                                            onClick={async () => {
                                                if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
                                                    alert("Please fill in all contact details (Name, Email, Phone)");
                                                    return;
                                                }

                                                setIsSubmitting(true);
                                                try {
                                                    const res = await fetch("/api/orders", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            customerName: customerInfo.name,
                                                            customerEmail: customerInfo.email,
                                                            customerPhone: customerInfo.phone,
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
                                                    const message = rawMsg.length > 150 ? rawMsg.slice(0, 150) + "…" : rawMsg;
                                                    alert(message);
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
