"use client";

import { useCart, type CartItem } from "@/lib/cart";

export default function FloatingCart() {
    const { items, totalCents } = useCart();
    const count = items.reduce((acc: number, i: CartItem) => acc + i.quantity, 0);

    return (
        <div className="fixed bottom-6 left-0 right-0 z-[60] px-4 pointer-events-none flex justify-center print:hidden">
            <button
                id="cart-fly-target"
                onClick={() => window.dispatchEvent(new CustomEvent("open-cart"))}
                className={`pointer-events-auto flex items-center gap-4 bg-orange-500 text-black px-6 py-4 rounded-full shadow-[0_20px_50px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all group border-2 border-white/20 backdrop-blur-md ${count === 0 ? "opacity-0 scale-50 pointer-events-none" : "opacity-100 scale-100"}`}
            >
                <div className="relative">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {count > 0 && (
                        <span className="absolute -top-3 -right-3 bg-black text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-orange-500">
                            {count}
                        </span>
                    )}
                </div>
                
                <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-70">View Cart</span>
                    <span className="text-lg font-bold">
                        ${(totalCents / 100).toFixed(2)}
                    </span>
                </div>

                <div className="ml-2 pl-4 border-l border-black/10">
                    <svg className="h-5 w-5 animate-bounce-horizontal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            </button>
        </div>
    );
}
