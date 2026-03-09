"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCart, type CartItem } from "@/lib/cart";
import { useEffect, useState } from "react";

export default function CartDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { items, updateQuantity, removeFromCart, totalCents } = useCart();

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
                                    <h2 className="text-xl font-bold">Your Order ({cartCount})</h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 text-gray-400 hover:text-white transition"
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
                                            <p>Your cart is empty</p>
                                            <button
                                                onClick={() => setIsOpen(false)}
                                                className="text-orange-500 font-semibold hover:underline"
                                            >
                                                Go back to menu
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">{item.name}</h3>
                                                        <p className="text-sm text-gray-400">
                                                            ${(item.priceCents / 100).toFixed(2)} each
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="px-3 py-1 hover:bg-white/5 transition"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="px-3 py-1 bg-white/5 font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="px-3 py-1 hover:bg-white/5 transition"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <div className="text-right w-20">
                                                        <p className="font-semibold">
                                                            ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {items.length > 0 && (
                                    <div className="p-6 space-y-4 bg-white/5 border-t border-white/10">
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-400">Your Details</h4>
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:border-orange-500 outline-none transition"
                                                    id="customerName"
                                                />
                                                <input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:border-orange-500 outline-none transition"
                                                    id="customerEmail"
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="Phone Number"
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:border-orange-500 outline-none transition"
                                                    id="customerPhone"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-lg font-bold pt-4 border-t border-white/10">
                                            <span>Total</span>
                                            <span className="text-orange-500">${(totalCents / 100).toFixed(2)}</span>
                                        </div>

                                        <button
                                            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-500 transition shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isSubmitting || items.length === 0}
                                            onClick={async () => {
                                                const name = (document.getElementById("customerName") as HTMLInputElement).value;
                                                const email = (document.getElementById("customerEmail") as HTMLInputElement).value;
                                                const phone = (document.getElementById("customerPhone") as HTMLInputElement).value;

                                                if (!name || !email || !phone) {
                                                    alert("Please fill in all contact details");
                                                    return;
                                                }

                                                setIsSubmitting(true);
                                                try {
                                                    const res = await fetch("/api/orders", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            customerName: name,
                                                            customerEmail: email,
                                                            customerPhone: phone,
                                                            items,
                                                        }),
                                                    });
                                                    const data = await res.json();
                                                    if (data.clientSecret) {
                                                        window.location.href = `/checkout?clientSecret=${data.clientSecret}&orderId=${data.orderId}&amount=${items.reduce((acc, i) => acc + i.priceCents * i.quantity, 0)}`;
                                                    } else {
                                                        alert("Checkout failed: " + (data.error || "Unknown error"));
                                                        setIsSubmitting(false);
                                                    }
                                                } catch (err) {
                                                    console.error("Checkout error", err);
                                                    alert("An error occurred during checkout");
                                                    setIsSubmitting(false);
                                                }
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </span>
                                            ) : (
                                                "Checkout Now"
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
