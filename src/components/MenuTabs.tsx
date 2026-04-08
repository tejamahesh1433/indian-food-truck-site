"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart, type CartItem } from "@/lib/cart";
import ItemCustomizationModal, { type CustomizationMenuItem } from "./ItemCustomizationModal";
import { useToast } from "@/components/ui/Toast";

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
    allergens?: string[];
    stockCount?: number | null;
    isStockTracked?: boolean;
    addons?: { id: string; name: string; priceCents: number; isAvailable: boolean }[];
    avgRating?: number;
    reviewCount?: number;
    reviews?: { text: string }[];
    prepTime?: string | null;
    pairedItemIds?: string[];
}

function ItemCard({ item, onAdd, onFavorite, isFavorite }: { item: MenuItem; onAdd: (item: MenuItem) => void; onFavorite: (id: string) => void; isFavorite: boolean }) {
    const isSoldOut = Boolean(item.isStockTracked && item.stockCount === 0);

    return (
        <div 
            onClick={() => {
                if (!isSoldOut) onAdd(item);
            }} 
            className={`cursor-pointer group rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden hover:bg-white/10 transition flex flex-col h-full ${isSoldOut ? "opacity-60 bg-white/5 grayscale-[0.5]" : "bg-white/5"}`}
        >
            <div className="relative h-28 sm:h-36 md:h-44">
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
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20">
                        <span className={`inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-bold uppercase px-2 py-0.5 sm:py-1 rounded-full border backdrop-blur-md shadow-lg ${
                            item.reviewCount! > 0 
                                ? "bg-black/60 border-white/10 text-yellow-400" 
                                : "bg-black/40 border-white/5 text-gray-500"
                        }`}>
                            <svg className={`w-2 sm:w-2.5 h-2 sm:h-2.5 ${item.reviewCount! > 0 ? "text-yellow-400" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {item.reviewCount! > 0 ? `${item.avgRating} (${item.reviewCount})` : "0.0"}
                        </span>
                </div>
                {isSoldOut && (
                    <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-red-600 text-white font-black uppercase tracking-widest px-4 py-2 rounded-xl text-xs sm:text-sm md:text-lg rotate-[-10deg] shadow-2xl">
                            Sold Out
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex items-end justify-between gap-2 md:gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-base md:text-xl font-semibold truncate md:whitespace-normal">{item.name}</h3>
                        {item.priceCents > 0 && (
                            <div className="mt-0.5 md:mt-1 text-orange-400 font-semibold text-[10px] sm:text-sm md:text-base">
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
                            disabled={isSoldOut}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAdd(item);
                            }}
                            className={`${isSoldOut ? "bg-gray-700 text-gray-400" : "bg-orange-500 text-black hover:bg-orange-400"} px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[11px] md:text-base font-black transition shadow-lg active:scale-95 flex items-center justify-center`}
                        >
                            {isSoldOut ? "Sold Out" : "+ Add"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-3 md:p-6 flex-1 flex flex-col">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-300 line-clamp-2">{item.description}</p>

                <div className="mt-auto pt-3 flex justify-between items-end gap-2">
                    <div className="flex flex-wrap gap-1 md:gap-2 items-center">
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
                        {item.allergens && item.allergens.map(allergen => (
                            <span key={allergen} title={allergen} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400">
                                {allergen}
                            </span>
                        ))}
                    </div>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onFavorite(item.id);
                        }}
                        className="bg-black/40 backdrop-blur-sm border border-white/10 p-2 md:p-2.5 rounded-full hover:bg-black/60 transition active:scale-95 shrink-0"
                        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                        <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isFavorite ? "text-red-500 fill-red-500" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
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

    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data: session } = useSession();
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    const { addToCart, items: cartItems, totalCents } = useCart();
    const { toast } = useToast();
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

    useEffect(() => {
        const fetchFavorites = async () => {
            if (session?.user) {
                try {
                    const res = await fetch("/api/user/favorites");
                    if (res.ok) {
                        const data = await res.json();
                        setFavorites(new Set(data.favorites));
                    }
                } catch (e) {
                    console.error("Failed to load favorites", e);
                }
            } else {
                setFavorites(new Set());
            }
        };
        fetchFavorites();
    }, [session]);

    const toggleFavorite = async (id: string) => {
        if (!session?.user) {
            alert("Please login to save favorites.");
            return;
        }

        const isFav = favorites.has(id);
        const action = isFav ? "remove" : "add";

        // Optimistic UI
        setFavorites(prev => {
            const next = new Set(prev);
            if (isFav) next.delete(id);
            else next.add(id);
            return next;
        });

        try {
            const res = await fetch("/api/user/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ menuItemId: id, action })
            });
            if (!res.ok) throw new Error("Failed to toggle favorite");
            const data = await res.json();
            setFavorites(new Set(data.favorites));
        } catch (error) {
            console.error("Favorite error", error);
            // Revert optimistically on failure
            setFavorites(prev => {
                const next = new Set(prev);
                if (isFav) next.add(id);
                else next.delete(id);
                return next;
            });
        }
    };

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

    // Upsell logic: Priority 1: Manual pairings, Priority 2: Popular Fallbacks (Excluding Mains)
    const manualPairingIds = selectedItem?.pairedItemIds || [];
    const manualPairings = items.filter(it => manualPairingIds.includes(it.id));
    
    // Fallback logic: Only suggest non-mains (Sides, Drinks, Desserts)
    const fallbackPairings = items.filter(it => 
        (it.isPopular || ["Sides", "Drinks", "Desserts", "Accompaniments"].includes(it.category)) && 
        it.category !== "Mains" &&
        it.category !== "Wraps" &&
        it.id !== selectedItem?.id &&
        !manualPairingIds.includes(it.id)
    );

    // Enforce uniqueness and limit to 4 items for better curation
    const allCandidates = [...manualPairings, ...fallbackPairings];
    const uniqueCandidates = Array.from(new Map(allCandidates.map(item => [item.id, item])).values());
    const upsellCandidates = uniqueCandidates.slice(0, 4);

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

                <div className="mt-8 flex gap-2.5 overflow-x-auto pb-4 hide-scrollbar snap-x -mx-6 px-6">
                    {categories.map((c) => {
                        const isActive = c === active;
                        return (
                            <button
                                key={c}
                                onClick={() => setActive(c)}
                                className={[
                                    "px-5 py-2.5 rounded-full border transition text-sm font-semibold whitespace-nowrap snap-start",
                                    isActive
                                        ? "bg-orange-500 text-black border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                                        : "border-white/10 hover:border-white/30 text-gray-400 bg-white/5",
                                ].join(" ")}
                            >
                                {c}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setPopularOnly((v) => !v)}
                        className={[
                            "px-5 py-2.5 rounded-full border transition text-sm font-semibold whitespace-nowrap snap-start",
                            popularOnly
                                ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                : "border-white/10 hover:border-white/30 text-gray-400 bg-white/5",
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
                                isFavorite={favorites.has(item.id)}
                                onFavorite={toggleFavorite}
                                onAdd={(m) => {
                                    setSelectedItem(m);
                                    setIsModalOpen(true);
                                }}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {!loading && filtered.length === 0 && (
                    <div className="mt-10 p-10 text-center text-gray-400 bg-white/5 rounded-3xl border border-white/10">
                        No matches. Try a different search or clear filters.
                    </div>
                )}
                
                <ItemCustomizationModal 
                    key={selectedItem?.id || "none"}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    item={selectedItem as unknown as CustomizationMenuItem}
                    upsellItems={upsellCandidates as unknown as CustomizationMenuItem[]}
                    onQuickAdd={(u: CustomizationMenuItem) => {
                        addToCart({
                            menuItemId: u.id,
                            name: u.name,
                            priceCents: u.priceCents,
                            imageUrl: u.imageUrl || undefined,
                            addons: [],
                            notes: "Quick add"
                        });
                        toast.success(`Added ${u.name} to cart`);
                    }}
                    onAdd={(payload) => {
                        for (let i = 0; i < payload.quantity; i++) {
                            addToCart({
                                menuItemId: selectedItem!.id,
                                name: selectedItem!.name,
                                priceCents: selectedItem!.priceCents,
                                imageUrl: selectedItem!.imageUrl || undefined,
                                addons: payload.addons,
                                notes: payload.notes
                            });
                        }
                        setIsModalOpen(false);
                    }}
                />
            </div>
        </section>
    );
}
