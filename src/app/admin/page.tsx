"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { site } from "@/config/site";

export default function AdminDashboardPage() {
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    }

    return (
        <main className="mx-auto max-w-4xl px-6 py-12">
            <div className="flex items-start justify-between mb-10 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-orange-500/90 text-black font-bold flex items-center justify-center shadow-[0_12px_40px_rgba(255,140,0,0.22)]">
                        {site.brand.short}
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-400">
                            Manage menu items, catering requests, and site settings.
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm font-medium border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition text-gray-300 hover:text-white"
                >
                    Logout
                </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <Link
                    href="/admin/menu-items"
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                        </div>
                        <span className="text-white/30 group-hover:text-white/60 transition group-hover:translate-x-1 duration-300">→</span>
                    </div>
                    <div className="font-semibold text-lg text-white">Menu Management</div>
                    <div className="mt-2 text-sm text-gray-400">
                        Add/edit items, prices, and filter tags (Veg/Spicy/Popular).
                    </div>
                </Link>

                <Link
                    href="/admin/catering"
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <span className="text-white/30 group-hover:text-white/60 transition group-hover:translate-x-1 duration-300">→</span>
                    </div>
                    <div className="font-semibold text-lg text-white">Catering Requests</div>
                    <div className="mt-2 text-sm text-gray-400">
                        View and respond to incoming catering and event forms.
                    </div>
                </Link>

                <div
                    className="rounded-2xl border border-white/10 bg-black/40 p-6 opacity-60 cursor-not-allowed"
                >
                    <div className="flex items-center justify-between mb-4 grayscale">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <span className="text-xs font-semibold bg-white/10 px-2 py-1 rounded text-white/50 uppercase tracking-wide">Coming Soon</span>
                    </div>
                    <div className="font-semibold text-lg text-white">Truck Schedule</div>
                    <div className="mt-2 text-sm text-gray-400">
                        Update today&apos;s location and the next upcoming stop.
                    </div>
                </div>

                <div
                    className="rounded-2xl border border-white/10 bg-black/40 p-6 opacity-60 cursor-not-allowed"
                >
                    <div className="flex items-center justify-between mb-4 grayscale">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <span className="text-xs font-semibold bg-white/10 px-2 py-1 rounded text-white/50 uppercase tracking-wide">Coming Soon</span>
                    </div>
                    <div className="font-semibold text-lg text-white">Site Settings</div>
                    <div className="mt-2 text-sm text-gray-400">
                        Manage phone numbers, Instagram links, and global configuration.
                    </div>
                </div>
            </div>
        </main>
    );
}
