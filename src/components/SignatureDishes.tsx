"use client";

import { useState } from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import SpotlightCard from "@/components/SpotlightCard";
import OrderModal from "@/components/OrderModal";

interface Dish {
    name: string;
    desc: string;
    tags: string[];
    image: string;
    theme?: string;
}

const dishes: Dish[] = [
    {
        name: "Butter Chicken",
        desc: "Creamy tomato curry, finished with butter and spice.",
        tags: ["Popular"],
        image: "/images/menu/butter-chicken.png",
        theme: "orange",
    },
    {
        name: "Paneer Tikka Wrap",
        desc: "Charred paneer, mint sauce, crunchy onions, warm wrap.",
        tags: ["Veg"],
        image: "/images/menu/paneer-wrap.png",
        theme: "green",
    },
    {
        name: "Chicken Tikka Roll",
        desc: "Smoky tikka, tangy chutney, street-style bite.",
        tags: ["Spicy"],
        image: "/images/menu/tikka-roll.png",
        theme: "red",
    },
    {
        name: "Samosa Chaat",
        desc: "Crispy samosa, yogurt, chutneys, masala crunch.",
        tags: ["Veg"],
        image: "/images/menu/samosa-chaat.png",
        theme: "green",
    },
    {
        name: "Mango Lassi",
        desc: "Thick, chilled, sweet mango yogurt drink.",
        tags: ["Drink"],
        image: "/images/menu/mango-lassi.png",
        theme: "blue",
    },
];

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
        Drink: { 
            color: "text-blue-400 bg-blue-500/10 border-blue-500/20", 
            icon: <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21l-2-2m-2-2l-2-2m0 0l-2-2m2 2l2 2m2 2l2 2M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" /></svg> 
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
    const [activeFilter, setActiveFilter] = useState("All");
    const [orderOpen, setOrderOpen] = useState(false);

    const filters = ["All", "Veg", "Spicy", "Popular"];
    const filteredDishes = activeFilter === "All" 
        ? dishes 
        : dishes.filter(d => d.tags.includes(activeFilter));

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

                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDishes.map((d) => (
                            <SpotlightCard key={d.name} className="p-0 border-white/10" spotlightColor="rgba(255, 120, 0, 0.15)">
                                <div className="group relative h-full flex flex-col bg-white/[0.02]">
                                    {/* Image Holder */}
                                    <div className="relative h-64 overflow-hidden">
                                        <Image
                                            src={d.image}
                                            alt={d.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover transition duration-700 ease-out group-hover:scale-110"
                                        />
                                        
                                        {/* Overlays */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
                                        
                                        {/* Floating Badge */}
                                        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                                            {d.tags.map((t) => <Tag key={t} type={t} />)}
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
                                            {d.desc}
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
                        ))}
                    </div>

                    <div className="mt-20 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            </Reveal>

            <OrderModal open={orderOpen} onClose={() => setOrderOpen(false)} />
        </section>
    );
}
