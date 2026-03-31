import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import OrderStatusActions from "./OrderStatusActions";
import AdminOrderChat from "./AdminOrderChat";
import Pagination from "./Pagination";

export const dynamic = "force-dynamic";

interface Props {
    searchParams: Promise<{ page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
    const { page: pageStr } = await searchParams;
    const page = Number(pageStr) || 1;
    const pageSize = 15;
    const skip = (page - 1) * pageSize;

    const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
            skip,
            take: pageSize,
            orderBy: { createdAt: "desc" },
            include: { items: true }
        }),
        prisma.order.count()
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

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
            <div className="flex items-center justify-between mb-8 text-white">
                <div>
                    <Link href="/admin" className="text-orange-500 hover:underline text-sm mb-2 inline-block font-bold uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                        Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold italic tracking-tighter uppercase">Order History</h1>
                    <p className="text-gray-400 mt-1 uppercase tracking-widest text-xs font-medium">Historical records showing page {page} of {totalPages}</p>
                </div>
                {totalCount > 0 && (
                    <div className="text-right hidden sm:block">
                        <div className="text-3xl font-black text-white italic tracking-tighter">{totalCount.toLocaleString()}</div>
                        <div className="text-[10px] uppercase tracking-widest font-black text-gray-500 whitespace-nowrap">Total Life-Time Orders</div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="p-12 text-center border border-white/10 rounded-3xl bg-white/5">
                        <p className="text-gray-400 text-lg font-bold uppercase tracking-widest mt-4">No orders found on this page.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <div key={order.id} className="border border-white/10 rounded-3xl bg-white/5 p-8 hover:bg-white/10 transition group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-2">
                                    <div className="text-3xl font-black text-orange-500 italic tracking-tighter">${(order.totalAmount / 100).toFixed(2)}</div>
                                    <a 
                                        href={`/invoice/${order.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        title={`Print Invoice for Order #${order.id.slice(-6).toUpperCase()}`}
                                        className="text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        Print Invoice
                                    </a>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-2xl tracking-tighter italic">#{order.id.slice(-6).toUpperCase()}</span>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${statusColors[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm font-bold text-gray-300">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                {order.customerName}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {order.customerPhone}
                                            </span>
                                            <span className="text-gray-500 font-medium ml-2">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                        </div>

                                        {order.notes && (
                                            <div className="mt-4 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                                                <span className="text-xl">📝</span>
                                                <div className="flex-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 block mb-1">Order Special Instructions</span>
                                                    <p className="text-sm font-bold text-white leading-relaxed">{order.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="py-6 border-y border-white/5">
                                        <div className="space-y-3">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className="h-8 w-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-sm italic">{item.quantity}</span>
                                                            <span className="font-bold text-base">{item.name}</span>
                                                        </div>
                                                        <span className="text-gray-400 font-mono text-sm">${(item.priceCents * item.quantity / 100).toFixed(2)}</span>
                                                    </div>
                                                    {item.notes && (
                                                        <div className="ml-11 mt-2 text-xs font-bold text-gray-400 bg-black/20 px-3 py-2 rounded-xl flex items-center gap-2 border border-white/5 italic">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                                                            Note: {item.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="text-xs uppercase tracking-widest text-gray-400 font-bold italic">Quick Actions</div>
                                        <OrderStatusActions orderId={order.id} currentStatus={order.status} />
                                    </div>

                                    <AdminOrderChat orderId={order.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Pagination 
                currentPage={page}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                baseUrl="/admin/orders"
            />
        </main>
    );
}
