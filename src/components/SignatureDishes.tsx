"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import SpotlightCard from "@/components/SpotlightCard";
import OrderModal from "@/components/OrderModal";

interface Dish {
    id: string;
    name: string;
    description: string;
    priceCents: number;
    imageUrl: string;
    isVeg: boolean;
    isNonVeg: boolean;
    isSpicy: boolean;
    isPopular: boolean;
    category: string;
    avgRating?: number;
    reviewCount?: number;
}

function Tag({ type }: { type: string }) {
    const config: Record<string, { color: string, icon: React.ReactNode }> = {
        Veg: { 
            color: "text-green-400 bg-green-500/10 border-green-500/20", 
            icon: <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> 
        },
        Spicy: { 
            color: "text-red-400 bg-red-500/10 border-red-500/20", 
            icon: <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.989 7.989 0 01-2.343 5.657z" /></svg> 
        },
        Popular: { 
            color: "text-orange-400 bg-orange-500/10 border-orange-500/20", 
            icon: <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> 
        },
    };

    const c = config[type] || { color: "text-gray-400 bg-white/5 border-white/10", icon: null };

    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${c.color} shadow-sm transition-all duration-300`}>
            {c.icon}
            {type}
        </span>
    );
}

export default function SignatureDishes() {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [orderOpen, setOrderOpen] = useState(false);

    useEffect(() => {
        fetch("/api/menu-items")
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.items)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setDishes(data.items.filter((i: any) => i.isPopular));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filters = ["All", "Veg", "Non-Veg", "Spicy"];
    const filteredDishes = activeFilter === "All" 
        ? dishes 
        : dishes.filter(d => (activeFilter === "Veg" && d.isVeg) || (activeFilter === "Non-Veg" && d.isNonVeg) || (activeFilter === "Spicy" && d.isSpicy));

    if (!loading && dishes.length === 0) return null;

    return (
        <section className="section-shell relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-3xl" />

            <Reveal>
                <div className="container-shell">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-xl">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                                Our <span className="text-orange-500">Signature</span> Dishes
                            </h2>
                            <p className="mt-4 text-lg text-gray-400 font-medium">
                                The heart and soul of Indian street food, perfected over decades. Elevated classics that define our flavor.
                            </p>
                        </div>
                        
                        {/* Interactive Filters */}
                        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.1em] bg-white/5 p-1.5 rounded-full border border-white/10">
                            {filters.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-6 py-2.5 rounded-full transition-all duration-500 ${
                                        activeFilter === f 
                                        ? "bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse" />
                            ))
                        ) : (
                            filteredDishes.map((d) => (
                                <SpotlightCard key={d.id} className="p-0 border-white/10 w-full" spotlightColor="rgba(255, 120, 0, 0.15)">
                                    <div className="group relative h-full flex flex-col bg-white/[0.02]">
                                        {/* Image Holder */}
                                        <div className="relative h-64 overflow-hidden">
                                            {d.imageUrl ? (
                                                <Image
                                                    src={d.imageUrl}
                                                    alt={d.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    className="object-cover transition duration-700 ease-out group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-orange-500/10 flex items-center justify-center text-orange-500/40 font-bold uppercase tracking-widest">
                                                    No Image
                                                </div>
                                            )}
                                            
                                            {/* Overlays */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
                                            
                                            {/* Floating Badge (Top Left) */}
                                            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 items-start">
                                                <Tag type="Popular" />
                                                {d.isSpicy && <Tag type="Spicy" />}
                                            </div>

                                            {/* Rating Badge (Top Right) */}
                                            <div className="absolute top-4 right-4 z-10">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md shadow-xl ${
                                                    d.reviewCount! > 0 
                                                        ? "text-yellow-400 bg-black/60 border-yellow-500/20" 
                                                        : "text-gray-500 bg-black/40 border-white/5"
                                                }`}>
                                                    <svg className={`w-2.5 h-2.5 ${d.reviewCount! > 0 ? "text-yellow-400" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    {d.reviewCount! > 0 ? `${d.avgRating} (${d.reviewCount})` : "0.0"}
                                                </span>
                                            </div>

                                            {/* Dietary Badge (Bottom Right) */}
                                            <div className="absolute bottom-4 right-4 z-10 flex flex-wrap gap-1 items-end justify-end">
                                                {d.isVeg && (
                                                    <div title="Vegetarian" className="flex flex-col items-center justify-center border-2 border-green-700 rounded-sm bg-white/95 w-8 h-8 flex-shrink-0 shadow-md">
                                                        <div className="w-3.5 h-3.5 bg-green-700 rounded-full mb-0.5" />
                                                        <span className="text-[6px] font-bold text-green-700 leading-none">VEG</span>
                                                    </div>
                                                )}
                                                {d.isNonVeg && (
                                                    <div title="Non-Vegetarian" className="flex flex-col items-center justify-center border-2 border-red-700 rounded-sm bg-white/95 w-8 h-8 flex-shrink-0 shadow-md">
                                                        <div className="w-3.5 h-3.5 bg-red-700 rounded-full mb-0.5" />
                                                        <span className="text-[5px] font-bold text-red-700 leading-none tracking-tighter">NON-VEG</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hover Order Now Button (Centered Overlay) */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                                <button 
                                                    onClick={() => setOrderOpen(true)}
                                                    className="bg-white text-black font-bold px-8 py-3 rounded-full shadow-2xl hover:bg-orange-500 hover:text-white transition transform active:scale-95"
                                                >
                                                    Order Now
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-8 flex-1 flex flex-col">
                                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
                                                {d.name}
                                            </h3>
                                            <p className="text-gray-400 text-sm leading-relaxed font-medium mb-6">
                                                {d.description}
                                            </p>
                                            
                                            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between group/footer cursor-pointer" onClick={() => setOrderOpen(true)}>
                                                <span className="text-white/30 text-[10px] uppercase font-bold tracking-tighter group-hover/footer:text-orange-500/60 transition-colors">Order for Pickup</span>
                                                <svg className="w-5 h-5 text-orange-500/40 group-hover/footer:translate-x-1 group-hover/footer:text-orange-500 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </SpotlightCard>
                            ))
                        )}
                    </div>

                    <div className="mt-20 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            </Reveal>

            <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} />
        </section>
    );
}
