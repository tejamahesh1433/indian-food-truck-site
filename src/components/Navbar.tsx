"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSite } from "@/components/SiteProvider";
import OrderModal from "@/components/OrderModal";
import { useCart, type CartItem } from "@/lib/cart";

export default function Navbar() {
    const [atLocation, setAtLocation] = useState(false);
    const [orderOpen, setOrderOpen] = useState(false);
    const site = useSite();

    useEffect(() => {
        const el = document.getElementById("location");
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => setAtLocation(entry.isIntersecting),
            { threshold: 0.25 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    const base = "transition hover:text-white";
    const pill =
        "px-3 py-1.5 rounded-full border border-white/15 bg-white/10 text-white";

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="mx-auto max-w-6xl px-6 md:px-20 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    {site.brand.logoUrl ? (
                        <img src={site.brand.logoUrl} className="h-10 w-10 object-contain" alt={site.brand.name} />
                    ) : (
                        <div className="h-10 w-10 rounded-2xl bg-orange-500/90 text-black font-bold flex items-center justify-center shadow-[0_12px_40px_rgba(255,140,0,0.25)]">
                            {site.brand.short}
                        </div>
                    )}
                    <div className="leading-tight">
                        <div className="font-semibold">{site.brand.name}</div>
                        <div className="text-xs text-gray-400">{site.brand.city}</div>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-6 text-sm text-gray-200">
                    <Link href="/menu" className={base}>
                        Menu
                    </Link>
                    <Link href="/catering" className={base}>
                        Catering
                    </Link>

                    <Link href="/#location" className={atLocation ? pill : base}>
                        Find the Truck
                    </Link>

                    <button
                        onClick={() => setOrderOpen(true)}
                        className="border border-white/15 bg-white/5 px-4 py-2 rounded-full hover:border-white/40 transition"
                    >
                        Order Now
                    </button>

                    <a
                        href={`tel:${site.contact.phoneE164}`}
                        className="hidden md:inline-block bg-orange-500 text-black px-4 py-2 rounded-full font-semibold hover:bg-orange-400 transition"
                    >
                        Call
                    </a>

                    <CartTrigger />
                </nav>

                <a
                    href={`tel:${site.contact.phoneE164}`}
                    className="md:hidden bg-orange-500 text-black px-4 py-2 rounded-full font-semibold"
                >
                    Call
                </a>
            </div>

            <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} />
        </header>
    );
}

function CartTrigger() {
    const { items, totalCents } = useCart();
    const count = items.reduce((acc: number, i: CartItem) => acc + i.quantity, 0);

    return (
        <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-cart"))}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition group"
        >
            <div className="relative">
                <svg className="h-5 w-5 text-gray-400 group-hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-lg">
                        {count}
                    </span>
                )}
            </div>
            {count > 0 && (
                <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition">
                    ${(totalCents / 100).toFixed(2)}
                </span>
            )}
        </button>
    );
}
