"use client";

import Link from "next/link";

interface InvoicesSectionProps {
    orders: any[];
}

export default function InvoicesSection({ orders }: InvoicesSectionProps) {
    // Show only completed/ready/paid orders that can be invoiced
    const invoiceableOrders = orders.filter(
        (o) => ["COMPLETED", "READY", "PAID"].includes(o.status)
    );

    if (invoiceableOrders.length === 0) {
        return null;
    }

    return (
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    Invoices & Receipts
                </h2>
            </div>

            <div className="space-y-3">
                {invoiceableOrders.slice(0, 5).map((order) => (
                    <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-orange-500/30 transition group"
                    >
                        <div>
                            <p className="font-bold text-white group-hover:text-orange-400 transition">
                                Order #{order.id.slice(-6).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="font-bold text-orange-400">
                                    ${(order.totalAmount / 100).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400">{order.status}</p>
                            </div>

                            <Link
                                href={`/invoice/${order.id}`}
                                target="_blank"
                                className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-500 transition"
                            >
                                View
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {invoiceableOrders.length > 5 && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                    Showing 5 of {invoiceableOrders.length} invoices
                </p>
            )}
        </section>
    );
}
