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
        <section className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-black italic tracking-tighter uppercase text-white flex items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">📄</span>
                    Invoices
                </h2>
            </div>

            <div className="space-y-3">
                {invoiceableOrders.slice(0, 5).map((order) => (
                    <div
                        key={order.id}
                        className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl hover:border-orange-500/30 transition group"
                    >
                        <div className="min-w-0">
                            <p className="font-bold text-white text-sm group-hover:text-orange-400 transition">
                                #{order.id.slice(-6).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <p className="font-bold text-orange-400 text-sm">
                                ${(order.totalAmount / 100).toFixed(2)}
                            </p>

                            <Link
                                href={`/invoice/${order.id}`}
                                target="_blank"
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-500 transition"
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
