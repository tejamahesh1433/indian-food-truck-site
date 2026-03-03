import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAdminToken, getAdminCookieName } from "@/lib/adminAuth";
import type { MenuItem } from "@prisma/client";

async function isAuthenticated() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value;
    if (!token) return false;
    try {
        verifyAdminToken(token);
        return true;
    } catch {
        return false;
    }
}

export default async function AdminMenu() {
    const ok = await isAuthenticated();
    if (!ok) redirect("/admin/login");

    const items = await prisma.menuItem.findMany({
        orderBy: { category: "asc" },
    });

    return (
        <main className="min-h-screen bg-black text-white">
            <div className="container-shell py-12">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">Menu Manager</h1>
                        <p className="mt-2 text-gray-300">Create, edit, and disable menu items.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <button className="bg-brand-orange text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition">
                            + Add Menu Item
                        </button>
                        <Link href="/admin/catering" className="underline text-gray-300 hover:text-white">
                            Back to Inbox
                        </Link>
                        <form action="/api/admin/logout" method="post">
                            <button className="border border-white/15 bg-white/5 px-5 py-3 rounded-full hover:border-white/40 transition">
                                Logout
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 card overflow-hidden">
                    <div className="grid grid-cols-12 gap-0 border-b border-white/10 text-sm text-gray-400">
                        <div className="col-span-3 p-4">Item Name</div>
                        <div className="col-span-2 p-4">Category</div>
                        <div className="col-span-2 p-4">Price</div>
                        <div className="col-span-3 p-4">Availability</div>
                        <div className="col-span-2 p-4 text-right">Actions</div>
                    </div>

                    {items.length === 0 ? (
                        <div className="p-6 text-gray-300 text-center">No menu items yet. Click Add Menu Item to start.</div>
                    ) : (
                        items.map((item: MenuItem) => (
                            <div key={item.id} className="grid grid-cols-12 border-b border-white/5 items-center">
                                <div className="col-span-3 p-4">
                                    <div className="font-semibold text-lg">{item.name}</div>
                                    <div className="text-xs text-gray-400 mt-1 line-clamp-1">{item.description || "—"}</div>
                                </div>
                                <div className="col-span-2 p-4">
                                    <span className="pill">{item.category}</span>
                                </div>
                                <div className="col-span-2 p-4 font-mono text-gray-300">
                                    ${(item.priceCents / 100).toFixed(2)}
                                </div>
                                <div className="col-span-3 p-4">
                                    <span className={`pill ${item.isAvailable ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                                        {item.isAvailable ? "Available" : "Sold Out"}
                                    </span>
                                </div>
                                <div className="col-span-2 p-4 text-right flex gap-3 justify-end text-sm">
                                    <button className="text-brand-orange hover:text-orange-400 transition">Edit</button>
                                    <button className="text-red-400 hover:text-red-300 transition">Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
