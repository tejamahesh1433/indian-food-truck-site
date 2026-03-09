"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutContent() {
    const searchParams = useSearchParams();
    const clientSecret = searchParams.get("clientSecret");
    const orderId = searchParams.get("orderId");
    const [amount, setAmount] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (orderId) {
            // In a real app, fetch order details to show summary
            // For now we'll just use a placeholder or assume amount is passed
            // Let's mock the amount from URL for simplicity in this demo
            const amt = searchParams.get("amount");
            if (amt) setAmount(parseInt(amt));
        }
    }, [orderId, searchParams]);

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
                        Order Summary
                    </h3>

                    <div className="flex justify-between items-center py-4 border-t border-white/5">
                        <span className="text-gray-400 text-sm font-medium">Order ID</span>
                        <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded">#{orderId.slice(-6).toUpperCase()}</span>
                    </div>

                    <div className="flex justify-between items-center py-4 border-t border-white/5 text-xl font-bold">
                        <span>Total Due</span>
                        <span className="text-orange-500">${((amount ?? 0) / 100).toFixed(2)}</span>
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
