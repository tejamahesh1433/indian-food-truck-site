"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import OrderModal from "@/components/OrderModal";

export default function Navbar() {
    const [atLocation, setAtLocation] = useState(false);
    const [orderOpen, setOrderOpen] = useState(false);

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
                    <div className="h-10 w-10 rounded-2xl bg-orange-500/90 text-black font-bold flex items-center justify-center shadow-[0_12px_40px_rgba(255,140,0,0.25)]">
                        {site.brand.short}
                    </div>
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
                        className="bg-orange-500 text-black px-4 py-2 rounded-full font-semibold hover:bg-orange-400 transition"
                    >
                        Call
                    </a>
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
