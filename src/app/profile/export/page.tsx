import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AutoPrint from "./AutoPrint";

export const dynamic = "force-dynamic";

export default async function ExportPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            orders: {
                orderBy: { createdAt: "desc" },
                include: {
                    items: true
                }
            },
            reviews: {
                include: {
                    menuItem: {
                        select: { name: true }
                    }
                }
            },
            favorites: {
                include: {
                    menuItem: {
                        select: { name: true, category: true }
                    }
                }
            },
            savedLocations: true,
        }
    });

    if (!user) {
        redirect("/login");
    }

    const settings = await prisma.siteSettings.findUnique({
        where: { id: "global" }
    });

    const businessName = settings?.businessName || "Indian Food Truck";
    const exportDate = new Date().toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <main className="min-h-screen bg-white text-black p-12 sm:p-20 print:p-0 selection:bg-orange-100">
            <AutoPrint />
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex items-start justify-between border-b-4 border-black pb-10 mb-12">
                    <div>
                        <div className="bg-orange-600 text-white font-black text-2xl w-12 h-12 flex items-center justify-center rounded-lg mb-4 print:shadow-none shadow-lg">
                            {businessName.charAt(0)}
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">{businessName}</h1>
                        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mt-1">Personal Data Archive Statement</p>
                    </div>
                    <div className="text-right">
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mb-1">Generated On</p>
                        <p className="font-bold text-lg">{exportDate}</p>
                        <p className="text-neutral-500 text-xs mt-1">User ID: {user.id.slice(0, 8)}...</p>
                    </div>
                </header>

                {/* Profile Section */}
                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 border-b border-orange-100 pb-2 mb-6">Account Identity</h2>
                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mb-1">Display Name</p>
                            <p className="text-xl font-bold">{user.name || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mb-1">Email Address</p>
                            <p className="text-xl font-bold">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mb-1">Member Since</p>
                            <p className="font-bold">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mb-1">Communications</p>
                            <p className="font-bold text-sm">
                                Email Notifications: {user.emailNotifications ? "ENABLED" : "DISABLED"}<br/>
                                Marketing: {user.marketingEmails ? "OPT-IN" : "OPT-OUT"}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Order History */}
                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 border-b border-orange-100 pb-2 mb-6">Order History ({user.orders.length})</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="py-3 font-bold uppercase tracking-widest text-[10px]">Date</th>
                                <th className="py-3 font-bold uppercase tracking-widest text-[10px]">Items Summary</th>
                                <th className="py-3 font-bold uppercase tracking-widest text-[10px] text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {user.orders.map(order => (
                                <tr key={order.id} className="break-inside-avoid">
                                    <td className="py-4 align-top">
                                        <p className="font-bold text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        <p className="text-[10px] text-neutral-400 font-mono italic">#{order.id.slice(-6).toUpperCase()}</p>
                                    </td>
                                    <td className="py-4 align-top">
                                        <div className="space-y-1">
                                            {order.items.map(item => (
                                                <div key={item.id} className="text-xs">
                                                    <span className="font-bold">{item.quantity}x</span> {item.name}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-4 align-top text-right font-black text-sm">
                                        ${(order.totalAmount / 100).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <div className="grid grid-cols-2 gap-12 page-break-before">
                    {/* Reviews */}
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 border-b border-orange-100 pb-2 mb-6">Your Reviews</h2>
                        <div className="space-y-6">
                            {user.reviews.map(review => (
                                <div key={review.id} className="break-inside-avoid">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{review.menuItem?.name || "Deleted Item"}</p>
                                    <div className="flex gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < review.rating ? "text-orange-500" : "text-neutral-200"}>★</span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-neutral-600 italic leading-relaxed">"{review.text}"</p>
                                </div>
                            ))}
                            {user.reviews.length === 0 && <p className="text-xs text-neutral-400 italic">No reviews recorded.</p>}
                        </div>
                    </section>

                    {/* Favorites */}
                    <section>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 border-b border-orange-100 pb-2 mb-6">Favorites</h2>
                        <div className="space-y-3">
                            {user.favorites.map(fav => (
                                <div key={fav.id} className="flex justify-between items-center text-xs break-inside-avoid">
                                    <span className="font-bold">{fav.menuItem.name}</span>
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 px-2 py-0.5 rounded">{fav.menuItem.category}</span>
                                </div>
                            ))}
                            {user.favorites.length === 0 && <p className="text-xs text-neutral-400 italic">No favorite items marked.</p>}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="mt-24 pt-12 border-t border-neutral-100 text-center">
                    <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.5em] mb-4">Official Data Archive</p>
                    <p className="text-xs text-neutral-400 leading-relaxed max-w-lg mx-auto">
                        This document constitutes a full disclosure of personal data held by {businessName} associated with this account as of the export date.
                    </p>
                </footer>
            </div>
        </main>
    );
}
