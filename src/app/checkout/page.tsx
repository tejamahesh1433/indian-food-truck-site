"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutContent() {
    const searchParams = useSearchParams();
    const clientSecret = searchParams.get("clientSecret");
    const orderId = searchParams.get("orderId");

    const { amount, breakdown } = useMemo(() => {
        const amt = searchParams.get("amount");
        const sub = searchParams.get("subtotal");
        const tx = searchParams.get("tax");
        
        const parsedAmount = amt ? parseInt(amt) : null;
        return {
            amount: parsedAmount,
            breakdown: {
                subtotal: sub ? parseInt(sub) : (parsedAmount ?? 0),
                tax: tx ? parseInt(tx) : 0,
            }
        };
    }, [searchParams]);

    if (!clientSecret || !orderId) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Invalid checkout session</h2>
                <p className="text-gray-400 mt-2">Please go back to the menu and try again.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="text-center">
                    <h1 className="text-4xl font-black italic tracking-tighter">COMPLETE ORDER</h1>
                    <p className="text-gray-400 mt-2 uppercase tracking-widest text-sm font-bold">Secure Checkout</p>
                </div>

                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        Order Breakdown
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-400 text-sm font-medium">Items Subtotal</span>
                            <span className="text-sm font-bold text-white">${(breakdown.subtotal / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-400 text-sm font-medium">CT Sales Tax (6.35%)</span>
                            <span className="text-sm font-bold text-white">${(breakdown.tax / 100).toFixed(2)}</span>
                        </div>

                        
                        <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Order Reference</span>
                            <span className="font-mono text-[10px] bg-white/5 px-2 py-1 rounded">#${orderId.slice(-6).toUpperCase()}</span>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/5 text-2xl font-black italic tracking-tighter">
                            <span className="text-white">TOTAL DUE</span>
                            <span className="text-orange-500 shadow-orange-500/20 drop-shadow-2xl">
                                ${( (amount ?? 0) / 100).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret,
                        appearance: { theme: 'night' }
                    }}
                >
                    <CheckoutForm amount={amount ?? 0} orderId={orderId} />
                </Elements>
            </motion.div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <main className="min-h-screen bg-[#0b0b0b] text-white">
            <Navbar />
            <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-orange-500 font-bold tracking-widest">LOADING SECURE GATEWAY...</div>
            </div>}>
                <CheckoutContent />
            </Suspense>
        </main>
    );
}
