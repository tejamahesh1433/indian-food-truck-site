import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

import OrderTrackingList from "@/components/OrderTrackingList";

export const dynamic = "force-dynamic";

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
                    <OrderTrackingList initialOrders={JSON.parse(JSON.stringify(user.orders))} />
                )}
            </section>
        </main>
    );
}
