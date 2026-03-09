"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/lib/cart";

export default function OrderSuccessPage() {
    const { clearCart } = useCart();

    useEffect(() => {
        // Clear cart on successful landing
        clearCart();
    }, [clearCart]);

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-[#0b0b0b] text-white">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full text-center space-y-8"
            >
                <div className="relative inline-block">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="h-24 w-24 bg-green-500 rounded-full flex items-center justify-center mx-auto"
                    >
                        <svg className="h-12 w-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0, 0.5, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-green-500 rounded-full"
                    />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black italic tracking-tighter">ORDER RECEIVED!</h1>
                    <p className="text-gray-400 text-lg">
                        Thank you for your order. We&apos;ve sent a confirmation email to your inbox.
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left space-y-4">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Next Steps</h4>
                        <p className="mt-2 text-sm text-gray-300">
                            Our team is currently preparing your delicious meal. You&apos;ll receive an update when it&apos;s ready for pickup at the truck!
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="w-full bg-orange-500 text-black py-4 rounded-2xl font-bold hover:bg-orange-400 transition shadow-[0_12px_40px_rgba(255,140,0,0.22)]"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href="/menu"
                        className="w-full border border-white/10 bg-white/5 py-4 rounded-2xl font-bold hover:bg-white/10 transition"
                    >
                        Order More
                    </Link>
                </div>

                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                    Follow us for truck updates
                </p>
            </motion.div>
        </main>
    );
}
