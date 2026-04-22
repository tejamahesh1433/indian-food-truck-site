"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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

    const navItems = useMemo(() => [
        { label: "Menu", href: "/menu" },
        { label: "Catering", href: "/catering" },
        { label: "About", href: "/about" },
        { label: "Find the Truck", href: "/#location", forceActive: atLocation },
    ], [atLocation]);

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 md:px-8 py-3 flex items-center justify-between">
                    {/* Left: Logo */}
                    <Link href="/" className="flex items-center gap-3 shrink-0">
                        {site.brand.logoUrl ? (
                            <Image 
                                src={site.brand.logoUrl} 
                                className="h-9 w-9 object-contain" 
                                alt={site.brand.businessName} 
                                width={36}
                                height={36}
                                priority
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-xl bg-orange-500 text-black font-bold flex items-center justify-center shadow-lg">
                                {site.brand.shortCode}
                            </div>
                        )}
                        <div className="leading-tight hidden sm:block">
                            <div className="font-bold text-sm">{site.brand.businessName}</div>
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


                        {session?.user ? (
                            <Link href="/profile" className="flex items-center gap-2 group">
                                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition">
                                    <svg className="h-4 w-4 text-gray-400 group-hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <span className="font-bold text-xs uppercase tracking-widest text-gray-300 group-hover:text-white transition">Profile</span>
                            </Link>
                        ) : (
                            <Link href="/login" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition">
                                Login
                            </Link>
                        )}

                        {session?.user && (
                            <Link 
                                href="/api/auth/signout" 
                                className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-red-400 transition-colors py-2 px-3 border border-white/5 hover:border-red-500/20 rounded-lg bg-white/5"
                            >
                                Sign Out
                            </Link>
                        )}
                    </div>

                    {/* Right: Actions (Mobile) */}
                    <div className="flex md:hidden items-center gap-3">
                        <PillNav items={navItems} />
                    </div>
                </div>
            </header>

            <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} />
        </>
    );
}
