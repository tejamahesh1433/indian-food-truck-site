import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./ui/LogoutButton";
import { site } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const newCateringCount = await prisma.cateringRequest.count({
        where: {
            status: "NEW",
            isArchived: false
        }
    });

    const paidOrdersCount = await prisma.order.count({
        where: {
            status: "PAID"
        }
    });

    const newsletterCount = await prisma.newsletterSubscriber.count();

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
                <LogoutButton />
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
                        <div className="flex items-center gap-2">
                            {newCateringCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                    {newCateringCount} NEW
                                </span>
                            )}
                            <span className="text-white/30 group-hover:text-white/60 transition group-hover:translate-x-1 duration-300">→</span>
                        </div>
                    </div>
                    <div className="font-semibold text-lg text-white">Catering Requests</div>
                    <div className="mt-2 text-sm text-gray-400">
                        View and respond to incoming catering and event forms.
                    </div>
                </Link>

                <Link
                    href="/admin/orders"
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        </div>
                        <div className="flex items-center gap-2">
                            {paidOrdersCount > 0 && (
                                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                    {paidOrdersCount} NEW
                                </span>
                            )}
                            <span className="text-white/30 group-hover:text-white/60 transition group-hover:translate-x-1 duration-300">→</span>
                        </div>
                    </div>
                    <div className="font-semibold text-lg text-white">Online Orders</div>
                    <div className="mt-2 text-sm text-gray-400">
                        Manage customer food orders, tracking status from paid to ready.
                    </div>
                </Link>

                <Link
                    href="/admin/locations"
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <span className="text-white/30 group-hover:text-white/60 transition group-hover:translate-x-1 duration-300">→</span>
                    </div>
                    <div className="font-semibold text-lg text-white">Truck Schedule</div>
                    <div className="mt-2 text-sm text-gray-400">
                        Update today&apos;s location and the next upcoming stop.
                    </div>
                </Link>

                <Link
                    href="/admin/settings"
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <span className="text-white/30 group-hover:text-white/60 transition group-hover:translate-x-1 duration-300">→</span>
                    </div>
                    <div className="font-semibold text-lg text-white">Site Settings</div>
                    <div className="mt-2 text-sm text-gray-400">
                        Manage phone numbers, Instagram links, and global configuration.
                    </div>
                </Link>

                <Link
                    href="/admin/catering-menu"
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition border-dashed"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        </div>
                        <span className="text-white/30 group-hover:text-white/60 transition group-hover:translate-x-1 duration-300">→</span>
                    </div>
                    <div className="font-semibold text-lg text-white">Catering Menu</div>
                    <div className="mt-2 text-sm text-gray-400">
                        Manage professional catering items, pricing tiers, and categories.
                    </div>
                </Link>

                <Link
                    href="/admin/reviews"
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition border-dashed"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                        </div>
                        <span className="text-white/30 group-hover:text-white/60 transition group-hover:translate-x-1 duration-300">→</span>
                    </div>
                    <div className="font-semibold text-lg text-white">Customer Reviews</div>
                    <div className="mt-2 text-sm text-gray-400">
                        Approve, reject, or delete customer reviews before they appear on the site.
                    </div>
                </Link>

                <Link
                    href="/admin/todays-special"
                    className="group rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6 hover:bg-orange-500/10 transition shadow-[0_0_40px_rgba(249,115,22,0.05)]"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span className="text-white/30 group-hover:text-white/60 transition group-hover:translate-x-1 duration-300">→</span>
                    </div>
                    <div className="font-semibold text-lg text-white">Today&apos;s Special</div>
                    <div className="mt-2 text-sm text-gray-400">
                        Update the featured dish of the day with price and description.
                    </div>
                </Link>

                <Link
                    href="/admin/menu-items?filter=popular"
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/20">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                        </div>
                        <span className="text-white/30 group-hover:text-white/60 transition group-hover:translate-x-1 duration-300">→</span>
                    </div>
                    <div className="font-semibold text-lg text-white">Signature Dishes</div>
                    <div className="mt-2 text-sm text-gray-400">
                        Manage which items appear in the featured &quot;Signature&quot; section on the home page.
                    </div>
                </Link>

                <Link
                    href="/admin/newsletter"
                    className="group rounded-2xl border border-pink-500/30 bg-pink-500/5 p-6 hover:bg-pink-500/10 transition shadow-[0_0_40px_rgba(236,72,153,0.05)]"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {newsletterCount} TOTAL
                            </span>
                            <span className="text-white/30 group-hover:text-white/60 transition group-hover:translate-x-1 duration-300">→</span>
                        </div>
                    </div>
                    <div className="font-semibold text-lg text-white">Newsletter Subscribers</div>
                    <div className="mt-2 text-sm text-gray-400">
                        View, export, and manage your email subscriber list.
                    </div>
                </Link>
            </div>
        </main>
    );
}
