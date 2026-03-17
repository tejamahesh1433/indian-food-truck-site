"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "@/components/SiteProvider";
import OrderModal from "@/components/OrderModal";
import { useCart, type CartItem } from "@/lib/cart";
import { useSession } from "next-auth/react";

import PillNav from "./PillNav";
import Magnet from "./Magnet";

export default function Navbar() {
    const [atLocation, setAtLocation] = useState(false);
    const [orderOpen, setOrderOpen] = useState(false);
    const site = useSite();
    const { data: session } = useSession();
    const pathname = usePathname();

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

    const navItems = [
        { label: "Menu", href: "/menu" },
        { label: "Catering", href: "/catering" },
        { label: "Find the Truck", href: "/#location", forceActive: atLocation },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 md:px-8 py-3 flex items-center justify-between">
                    {/* Left: Logo */}
                    <Link href="/" className="flex items-center gap-3 shrink-0">
                        {site.brand.logoUrl ? (
                            <img src={site.brand.logoUrl} className="h-9 w-9 object-contain" alt={site.brand.name} />
                        ) : (
                            <div className="h-9 w-9 rounded-xl bg-orange-500 text-black font-bold flex items-center justify-center shadow-lg">
                                {site.brand.short}
                            </div>
                        )}
                        <div className="leading-tight hidden sm:block">
                            <div className="font-bold text-sm">{site.brand.name}</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">{site.brand.city}</div>
                        </div>
                    </Link>

                    {/* Middle: Pill Nav (Desktop) */}
                    <div className="hidden md:flex flex-1 justify-center px-4">
                        <PillNav items={navItems} />
                    </div>

                    {/* Right: Actions (Desktop) */}
                    <div className="hidden md:flex items-center gap-6 text-sm text-gray-200">
                        <Magnet padding={30} magnetStrength={12}>
                            <button
                                onClick={() => setOrderOpen(true)}
                                className="border border-white/15 bg-white/5 px-4 py-2 rounded-full hover:border-white/40 transition"
                            >
                                Order Now
                            </button>
                        </Magnet>

                        <a
                            href={`tel:${site.contact.phoneE164}`}
                            className="bg-orange-500 text-black px-4 py-2 rounded-full font-semibold hover:bg-orange-400 transition"
                        >
                            Call
                        </a>

                        <CartTrigger />

                        {session?.user ? (
                            <Link href="/profile" className="flex items-center gap-2 group">
                                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition">
                                    <svg className="h-4 w-4 text-gray-400 group-hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <span className="font-bold text-xs uppercase tracking-widest text-gray-300 group-hover:text-white transition">My Orders</span>
                            </Link>
                        ) : (
                            <Link href="/login" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Right: Actions (Mobile) */}
                    <div className="flex md:hidden items-center gap-3">
                        <CartTrigger />
                        <PillNav items={navItems} />
                    </div>
                </div>
            </header>

            <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} />
        </>
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
