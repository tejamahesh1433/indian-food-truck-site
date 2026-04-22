"use client";

import Image from "next/image";
import Link from "next/link";

interface FavoritesSectionProps {
    favorites: any[];
}

export default function FavoritesSection({ favorites }: FavoritesSectionProps) {
    return (
        <section className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-black italic tracking-tighter uppercase text-white mb-4 flex items-center gap-2">
                <span className="text-xl">❤️</span>
                Your Favorites
            </h3>

            {favorites.length === 0 ? (
                <div className="py-8 text-center rounded-xl border border-dashed border-white/10 bg-white/5">
                    <p className="text-sm text-gray-500 mb-4">No favorites yet</p>
                    <Link
                        href="/menu"
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 transition"
                    >
                        Add to favorites →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {favorites.slice(0, 5).map((fav) => (
                        <Link
                            key={fav.id}
                            href={`/menu?item=${fav.menuItem?.id}`}
                            className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-orange-500/30 transition group"
                        >
                            {fav.menuItem?.image && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 shrink-0">
                                    <Image
                                        src={fav.menuItem.image}
                                        alt={fav.menuItem.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-sm truncate group-hover:text-orange-400 transition">
                                    {fav.menuItem?.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    ${(fav.menuItem?.priceCents / 100).toFixed(2)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
