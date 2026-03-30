"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { useCart } from "@/lib/cart";

interface SpecialDish {
    id: string;
    name: string;
    description: string;
    priceCents: number;
    imageUrl: string;
    isActive: boolean;
    isVeg?: boolean;
    isNonVeg?: boolean;
    isSpicy?: boolean;
    isPopular?: boolean;
}

export default function TodaysSpecial() {
    const [specials, setSpecials] = useState<SpecialDish[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        fetch("/api/todays-special")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSpecials(data.filter(s => s.isActive));
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Fetch Special Error:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center py-20 text-gray-500">Loading specials...</div>;
    
    if (specials.length === 0) {
        return null;
    }

    return (
        <section className="section-shell relative overflow-hidden">
            {/* Background design elements */}
            <div className="hidden md:block absolute top-1/2 left-0 -translate-y-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-orange-500/5 blur-[100px]" />
            
            <Reveal>
                <div className="container-shell">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="inline-block bg-orange-500 text-black text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                                    Recommended
                                </span>
                                <div className="h-1 w-1 rounded-full bg-orange-500" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                                Today&apos;s <span className="text-orange-500">Specials</span>
                            </h2>
                            <p className="mt-4 text-gray-400 font-medium max-w-xl">
                                Carefully curated dishes prepared with fresh ingredients and traditional spices. Available only today.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {specials.map((s) => (
                            <div key={s.id} className="group relative bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.05] transition-all duration-500 flex flex-col">
                                {/* Compact Image Header */}
                                <div className="relative h-64 w-full overflow-hidden">
                                    {s.imageUrl ? (
                                        <Image 
                                            src={s.imageUrl} 
                                            alt={s.name} 
                                            fill 
                                            className="object-cover transition duration-700 group-hover:scale-110"
                                            sizes="(max-width: 1024px) 100vw, 33vw"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-600">No Image</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    
                                    {/* Price Badge inside image */}
                                    <div className="absolute bottom-4 right-4 bg-orange-500 text-black px-4 py-2 rounded-2xl font-black text-lg shadow-xl translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <span className="text-xs mr-0.5 opacity-60">$</span>
                                        {(s.priceCents / 100).toFixed(2)}
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-black text-white group-hover:text-orange-500 transition-colors">
                                            {s.name}
                                        </h3>
                                        <div className="flex gap-2 items-center">
                                            {s.isVeg && (
                                                <div title="Vegetarian" className="flex flex-col items-center justify-center border-[1.5px] border-green-700 rounded-sm bg-white w-8 h-8 flex-shrink-0">
                                                    <div className="w-3.5 h-3.5 bg-green-700 rounded-full mb-0.5" />
                                                    <span className="text-[6px] font-bold text-green-700 leading-none">VEG</span>
                                                </div>
                                            )}
                                            {s.isNonVeg && (
                                                <div title="Non-Vegetarian" className="flex flex-col items-center justify-center border-[1.5px] border-red-700 rounded-sm bg-white w-8 h-8 flex-shrink-0">
                                                    <div className="w-3.5 h-3.5 bg-red-700 rounded-full mb-0.5" />
                                                    <span className="text-[5px] font-bold text-red-700 leading-none tracking-tighter">NON-VEG</span>
                                                </div>
                                            )}
                                            {s.isSpicy && (
                                                <span title="Spicy" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                                    Spicy
                                                </span>
                                            )}
                                            {s.isPopular && (
                                                <span title="Popular" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                                    Popular
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium mb-8 line-clamp-2 leading-relaxed">
                                        {s.description}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-white font-black text-xl">${(s.priceCents / 100).toFixed(2)}</span>
                                            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Price per dish</span>
                                        </div>
                                        
                                        <button 
                                            onClick={() => addToCart({
                                                id: `special-${s.id}`,
                                                name: `Today's Special: ${s.name}`,
                                                priceCents: s.priceCents,
                                                imageUrl: s.imageUrl || ""
                                            })}
                                            className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-full hover:bg-orange-500 hover:text-white transition-all transform active:scale-95 shadow-xl"
                                        >
                                            Add to Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
