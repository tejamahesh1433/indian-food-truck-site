"use client";

import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import Link from "next/link";


export default function CheckoutForm({ amount, orderId }: { amount: number; orderId: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message ?? "An unexpected error occurred.");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <PaymentElement
                    options={{
                        layout: "tabs",
                    }}
                />
            </div>

            {message && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {message}
                </div>
            )}

            <div className="space-y-4">
                <button
                    disabled={isLoading || !stripe || !elements}
                    className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-500 transition shadow-[0_12px_40px_rgba(249,115,22,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Scaling payment...
                        </>
                    ) : (
                        `Pay $${(amount / 100).toFixed(2)} Now`
                    )}
                </button>

                <p className="text-center text-[10px] text-gray-500 max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-bold">
                    By paying, you agree to our{" "}
                    <Link href="/terms" className="underline hover:text-white transition">Terms</Link>{" "}
                    &{" "}
                    <Link href="/privacy-policy" className="underline hover:text-white transition">Privacy</Link>
                </p>
            </div>

            <p className="text-center text-xs text-gray-500 uppercase tracking-widest font-bold opacity-50">
                Secure SSL Encrypted Payment
            </p>
        </form>
    );
}

