"use client";
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { categories, menuItems, MenuItem, MenuTag } from "@/data/menu";

function ItemCard({ item }: { item: MenuItem }) {
    return (
        <div className="group rounded-3xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition">
            <div className="relative h-44">
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition duration-300"
                    priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-semibold">{item.name}</h3>
                        {typeof item.price === "number" && (
                            <div className="mt-1 text-orange-400 font-semibold">
                                ${item.price}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6">
                <p className="text-gray-300">{item.desc}</p>

                {!!item.tags?.length && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map((t) => (
                            <span
                                key={t}
                                className="text-xs px-3 py-1 rounded-full bg-black/40 border border-white/10 text-gray-200"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MenuTabs() {
    const [active, setActive] = useState<(typeof categories)[number]>("Starters");
    const [popularOnly, setPopularOnly] = useState(false);
    const [query, setQuery] = useState("");
    const [vegOnly, setVegOnly] = useState(false);
    const [spicyOnly, setSpicyOnly] = useState(false);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        return menuItems
            .filter((m) => m.category === active)
            .filter((m) => {
                if (!q) return true;
                return (
                    m.name.toLowerCase().includes(q) ||
                    m.desc.toLowerCase().includes(q) ||
                    (m.tags ?? []).some((t) => t.toLowerCase().includes(q))
                );
            })
            .filter((m) => (vegOnly ? m.tags?.includes("Veg") : true))
            .filter((m) => (spicyOnly ? m.tags?.includes("Spicy") : true))
            .filter((m) => (popularOnly ? m.tags?.includes("Popular") : true));
    }, [active, query, vegOnly, spicyOnly, popularOnly]);

    return (
        <section className="px-6 md:px-20 py-12">
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
                        className="hidden md:inline-flex border border-white/15 px-5 py-3 rounded-full hover:border-white/40 transition"
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
                                    "px-5 py-2 rounded-full border transition",
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
                            "px-5 py-2 rounded-full border transition",
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
                                "px-5 py-2 rounded-full border transition",
                                vegOnly ? "bg-white text-black border-white" : "border-white/15 hover:border-white/40 text-gray-200",
                            ].join(" ")}
                        >
                            Veg
                        </button>

                        <button
                            onClick={() => setSpicyOnly((v) => !v)}
                            className={[
                                "px-5 py-2 rounded-full border transition",
                                spicyOnly ? "bg-white text-black border-white" : "border-white/15 hover:border-white/40 text-gray-200",
                            ].join(" ")}
                        >
                            Spicy
                        </button>

                        <button
                            onClick={() => {
                                setQuery("");
                                setVegOnly(false);
                                setSpicyOnly(false);
                            }}
                            className="px-5 py-2 rounded-full border border-white/15 hover:border-white/40 transition text-gray-200"
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
                        className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filtered.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="mt-10 card p-10 text-center text-gray-300">
                        No matches. Try a different search or clear filters.
                    </div>
                )}
            </div>
        </section>
    );
}
