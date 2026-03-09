import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import OrderStatusSelect from "./OrderStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: true }
    });

    const statusColors: Record<OrderStatus, string> = {
        PENDING: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        PAID: "bg-green-500/10 text-green-400 border-green-500/20",
        PREPARING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        READY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        COMPLETED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <main className="mx-auto max-w-6xl px-6 py-12 text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link href="/admin" className="text-orange-500 hover:underline text-sm mb-2 inline-block">← Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold">Online Orders</h1>
                    <p className="text-gray-400 mt-1">Manage and track customer food orders.</p>
                </div>
            </div>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="p-12 text-center border border-white/10 rounded-3xl bg-white/5">
                        <p className="text-gray-400 text-lg">No orders found yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <div key={order.id} className="border border-white/10 rounded-2xl bg-white/5 p-6 hover:bg-white/10 transition">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg">#{order.id.slice(-6).toUpperCase()}</span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium">{order.customerName} • {order.customerPhone}</p>
                                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xl font-bold text-orange-500">${(order.totalAmount / 100).toFixed(2)}</div>
                                        <div className="mt-2 text-white">
                                            <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Order Items</h4>
                                    <div className="space-y-2">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span className="text-gray-400">${(item.priceCents * item.quantity / 100).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
