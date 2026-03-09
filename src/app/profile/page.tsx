import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login?callbackUrl=/profile");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: {
            orders: {
                orderBy: { createdAt: "desc" },
                include: { items: true }
            }
        }
    });

    if (!user) {
        redirect("/login");
    }

    const statusColors: any = {
        PENDING: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        PAID: "bg-green-500/10 text-green-400 border-green-500/20",
        PREPARING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        READY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        COMPLETED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 max-w-4xl mx-auto">
            <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">My Profile</h1>
                    <div className="mt-2 flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                        <span className="text-orange-500">{user.name}</span>
                        <span className="opacity-20">•</span>
                        <span>{user.email}</span>
                    </div>
                </div>
                <LogoutButton />
            </header>

            <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">Order History</h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                        {user.orders.length} Total Orders
                    </span>
                </div>

                {user.orders.length === 0 ? (
                    <div className="py-20 text-center rounded-[2rem] border border-dashed border-white/10 bg-white/5">
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No orders yet. Let's change that!</p>
                        <Link href="/menu" className="mt-6 inline-block bg-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition shadow-lg shadow-orange-600/20">
                            View Menu
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {user.orders.map((order) => (
                            <div key={order.id} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition group">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-black text-xl italic tracking-tighter text-white">#{order.id.slice(-6).toUpperCase()}</span>
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-orange-500 italic tracking-tighter">${(order.totalAmount / 100).toFixed(2)}</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-orange-500 italic text-[10px]">{item.quantity}x</span>
                                                <span className="font-bold text-gray-300">{item.name}</span>
                                            </div>
                                            <span className="text-gray-500 text-xs font-mono font-bold">${(item.priceCents * item.quantity / 100).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {order.status === "READY" && (
                                    <div className="mt-6 p-4 bg-orange-500 text-black rounded-xl text-center font-black uppercase tracking-widest text-[10px] animate-pulse">
                                        Your order is ready for pickup! 🎊
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
