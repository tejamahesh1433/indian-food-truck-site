"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart";

interface MenuItem {
    id: string;
    name: string;
    description: string;
    priceCents: number;
    imageUrl: string;
    category: string;
    isVeg: boolean;
    isNonVeg: boolean;
    isSpicy: boolean;
    isPopular: boolean;
}

function ItemCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
    return (
        <div className="group rounded-2xl md:rounded-3xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition flex flex-col h-full">
            <div className="relative h-28 md:h-44">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-[1.03] transition duration-300"
                        priority={false}
                    />
                ) : (
                    <div className="w-full h-full bg-black/20 flex items-center justify-center">
                        <span className="text-white/20 text-sm">No Image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 flex items-end justify-between gap-2 md:gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs md:text-xl font-semibold truncate md:whitespace-normal">{item.name}</h3>
                        {item.priceCents > 0 && (
                            <div className="mt-0.5 md:mt-1 text-orange-400 font-semibold text-[10px] md:text-base">
                                ${(item.priceCents / 100).toFixed(2)}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-1 md:gap-2 relative z-10">
                        <div className="flex gap-0.5 md:gap-1 absolute bottom-[115%] right-0">
                            {item.isVeg && (
                                <div title="Vegetarian" className="flex flex-col items-center justify-center border-2 border-green-700 rounded-sm bg-white/95 w-5 h-5 md:w-7 md:h-7 flex-shrink-0 shadow-md">
                                    <div className="w-2 h-2 md:w-3 md:h-3 bg-green-700 rounded-full mb-0.5" />
                                    <span className="hidden md:block text-[5px] font-bold text-green-700 leading-none">VEG</span>
                                </div>
                            )}
                            {item.isNonVeg && (
                                <div title="Non-Vegetarian" className="flex flex-col items-center justify-center border-2 border-red-700 rounded-sm bg-white/95 w-5 h-5 md:w-7 md:h-7 flex-shrink-0 shadow-md">
                                    <div className="w-2 h-2 md:w-3 md:h-3 bg-red-700 rounded-full mb-0.5" />
                                    <span className="hidden md:block text-[4px] font-bold text-red-700 leading-none tracking-tighter">NON-VEG</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                onAdd(item);
                            }}
                            className="bg-orange-500 text-black px-2 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-base font-bold hover:bg-orange-400 transition shadow-lg active:scale-95"
                        >
                            + Add
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-3 md:p-6 flex-1">
                <p className="text-[10px] md:text-sm text-gray-300 line-clamp-2">{item.description}</p>

                <div className="mt-2 md:mt-4 flex flex-wrap gap-1 md:gap-2 items-center">
                    {item.isSpicy && (
                        <span title="Spicy" className="text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-black/40 border border-white/10 text-orange-500">
                            Spicy
                        </span>
                    )}
                    {item.isPopular && (
                        <span title="Popular" className="text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-black/40 border border-white/10 text-yellow-500">
                            Popular
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MenuTabs() {
    const [active, setActive] = useState<string>("All");
    const [query, setQuery] = useState("");
    const [vegOnly, setVegOnly] = useState(false);
    const [nonVegOnly, setNonVegOnly] = useState(false);
    const [spicyOnly, setSpicyOnly] = useState(false);
    const [popularOnly, setPopularOnly] = useState(false);

    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const { addToCart, items: cartItems, totalCents } = useCart();
    const cartCount = cartItems.reduce((acc: number, i: CartItem) => acc + i.quantity, 0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemsRes, catsRes] = await Promise.all([
                    fetch("/api/menu-items"),
                    fetch("/api/categories")
                ]);
                const itemsData = await itemsRes.json();
                const catsData = await catsRes.json();
                setItems(itemsData.items || []);
                setCategories(["All", ...(catsData.categories || [])]);
            } catch (err) {
                console.error("Failed to fetch menu data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = items.filter((item) => {
        const matchesCat = active === "All" || item.category === active;
        const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase());
        const matchesVeg = !vegOnly || item.isVeg;
        const matchesNonVeg = !nonVegOnly || item.isNonVeg;
        const matchesSpicy = !spicyOnly || item.isSpicy;
        const matchesPopular = !popularOnly || item.isPopular;
        return matchesCat && matchesQuery && matchesVeg && matchesNonVeg && matchesSpicy && matchesPopular;
    });

    return (
        <section className="px-6 md:px-20 py-12 relative">
            {cartCount > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] w-full max-w-xs px-4 md:hidden">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent("open-cart"))}
                        className="w-full bg-orange-600 text-white p-4 rounded-2xl font-bold shadow-2xl flex items-center justify-between"
                    >
                        <span className="flex items-center gap-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded-lg">{cartCount}</span>
                            View Cart
                        </span>
                        <span>${(totalCents / 100).toFixed(2)}</span>
                    </button>
                </div>
            )}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold">Menu</h1>
                        <p className="mt-2 text-gray-300">
                            Street classics, cooked fresh. Prices can be updated anytime.
                        </p>
                    </div>
                    <Link
                        href="/#location"
                        className="hidden md:inline-flex border border-white/15 px-5 py-3 rounded-full hover:border-white/40 transition text-sm font-medium"
                    >
                        Find the Truck
                    </Link>
                </div>

                <div className="mt-8 flex gap-3 flex-wrap">
                    {categories.map((c) => {
                        const isActive = c === active;
                        return (
                            <button
                                key={c}
                                onClick={() => setActive(c)}
                                className={[
                                    "px-5 py-2 rounded-full border transition text-sm font-medium",
                                    isActive
                                        ? "bg-orange-500 text-black border-orange-500"
                                        : "border-white/15 hover:border-white/40 text-gray-200",
                                ].join(" ")}
                            >
                                {c}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setPopularOnly((v) => !v)}
                        className={[
                            "px-5 py-2 rounded-full border transition text-sm font-medium",
                            popularOnly
                                ? "bg-white text-black border-white"
                                : "border-white/15 hover:border-white/40 text-gray-200",
                        ].join(" ")}
                    >
                        Popular
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search dishes (e.g., paneer, spicy, lassi)..."
                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30 text-white placeholder:text-gray-500"
                        />
                    </div>

                    <div className="flex gap-3 flex-wrap md:justify-end">
                        <button
                            onClick={() => setVegOnly((v) => !v)}
                            className={[
                                "px-5 py-2 rounded-full border transition text-sm font-medium",
                                vegOnly ? "bg-green-600 text-white border-green-600" : "border-white/15 hover:border-white/40 text-gray-200",
                            ].join(" ")}
                        >
                            Veg
                        </button>

                        <button
                            onClick={() => setNonVegOnly((v) => !v)}
                            className={[
                                "px-5 py-2 rounded-full border transition text-sm font-medium",
                                nonVegOnly ? "bg-red-600 text-white border-red-600" : "border-white/15 hover:border-white/40 text-gray-200",
                            ].join(" ")}
                        >
                            Non-Veg
                        </button>

                        <button
                            onClick={() => setSpicyOnly((v) => !v)}
                            className={[
                                "px-5 py-2 rounded-full border transition text-sm font-medium",
                                spicyOnly ? "bg-white text-black border-white" : "border-white/15 hover:border-white/40 text-gray-200",
                            ].join(" ")}
                        >
                            Spicy
                        </button>

                        <button
                            onClick={() => {
                                setQuery("");
                                setVegOnly(false);
                                setNonVegOnly(false);
                                setSpicyOnly(false);
                                setPopularOnly(false);
                                setActive("All");
                            }}
                            className="px-5 py-2 rounded-full border border-white/15 hover:border-white/40 transition text-gray-200 text-sm font-medium"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={active + (popularOnly ? "-popular" : "") + query + vegOnly + spicyOnly}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        className="mt-6 md:mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
                    >
                        {loading ? (
                            <div className="col-span-full py-20 text-center text-gray-400">Loading menu...</div>
                        ) : filtered.map((item) => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onAdd={(m) => addToCart({
                                    id: m.id,
                                    name: m.name,
                                    priceCents: m.priceCents,
                                    imageUrl: m.imageUrl
                                })}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {!loading && filtered.length === 0 && (
                    <div className="mt-10 p-10 text-center text-gray-400 bg-white/5 rounded-3xl border border-white/10">
                        No matches. Try a different search or clear filters.
                    </div>
                )}
            </div>
        </section>
    );
}
