import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
    });

    if (!order) {
        return notFound();
    }

    const settings = await prisma.siteSettings.findUnique({
        where: { id: "global" }
    });

    const businessName = settings?.businessName || "Indian Food Truck";
    const phone = settings?.phone || "Contact us for support";
    const cityState = settings?.cityState || "Hartford, CT";

    const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <main className="min-h-screen bg-neutral-100 text-black print:bg-white print:m-0 selection:bg-orange-200">
            <PrintButton />

            <div className="max-w-3xl mx-auto bg-white min-h-[11in] shadow-xl print:shadow-none p-12 sm:p-20 print:p-0">
                
                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start justify-between gap-8 pb-10 border-b-2 border-neutral-100">
                    <div>
                        <div className="w-16 h-16 bg-orange-500 rounded-xl mb-6 flex items-center justify-center text-white font-black text-3xl shadow-lg print:shadow-none">
                            {businessName.charAt(0)}
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-neutral-900 mb-2">{businessName}</h1>
                        <p className="text-neutral-500 text-sm font-medium">{cityState}</p>
                        <p className="text-neutral-500 text-sm font-medium">{phone}</p>
                    </div>

                    <div className="sm:text-right">
                        <h2 className="text-4xl font-black text-neutral-200 uppercase tracking-widest mb-4">Invoice</h2>
                        <div className="grid grid-cols-2 sm:flex sm:flex-col gap-x-8 gap-y-2 text-sm">
                            <div>
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Invoice No.</p>
                                <p className="font-mono font-bold text-neutral-800">#{order.id.slice(-8).toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Date</p>
                                <p className="font-semibold text-neutral-800">{formattedDate}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Customer Info */}
                <div className="py-10 grid sm:grid-cols-2 gap-10 border-b-2 border-neutral-100">
                    <div>
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mb-3">Bill To</p>
                        <p className="text-lg font-bold text-neutral-900">{order.customerName}</p>
                        <p className="text-neutral-600 mt-1">{order.customerEmail}</p>
                        <p className="text-neutral-600">{order.customerPhone}</p>
                        {order.notes && (
                            <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                                <p className="text-orange-800 font-bold uppercase tracking-widest text-[9px] mb-1">Special Instructions</p>
                                <p className="text-sm font-medium text-orange-900 leading-relaxed italic">&ldquo;{order.notes}&rdquo;</p>
                            </div>
                        )}
                    </div>
                    <div className="sm:text-right">
                        <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mb-3">Payment Status</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <span className="font-bold text-sm uppercase tracking-wide">{order.status === "PENDING" ? "PENDING" : "PAID"}</span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="py-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-neutral-800">
                                <th className="py-4 text-neutral-500 font-bold uppercase tracking-widest text-[10px] w-1/2">Item Description</th>
                                <th className="py-4 text-neutral-500 font-bold uppercase tracking-widest text-[10px] text-center w-1/6">Qty</th>
                                <th className="py-4 text-neutral-500 font-bold uppercase tracking-widest text-[10px] text-right w-1/6">Price</th>
                                <th className="py-4 text-neutral-800 font-bold uppercase tracking-widest text-[10px] text-right w-1/6">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {order.items.map((item) => (
                                <tr key={item.id} className="group hover:bg-neutral-50 transition-colors">
                                    <td className="py-6 pr-4">
                                        <p className="font-bold text-neutral-900">{item.name}</p>
                                        {item.notes && (
                                            <p className="text-xs font-semibold text-orange-600 mt-1 italic">
                                                Note: {item.notes}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-6 text-center text-neutral-600 font-medium">
                                        {item.quantity}
                                    </td>
                                    <td className="py-6 text-right text-neutral-600 font-medium whitespace-nowrap">
                                        ${(item.priceCents / 100).toFixed(2)}
                                    </td>
                                    <td className="py-6 text-right text-neutral-900 font-bold whitespace-nowrap">
                                        ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end pt-6 border-t-2 border-neutral-100">
                    <div className="w-full sm:w-1/2 lg:w-1/3 space-y-4">
                        <div className="flex justify-between text-neutral-600">
                            <span className="font-medium">Subtotal</span>
                            <span className="font-semibold">${(order.subtotalAmount / 100).toFixed(2)}</span>
                        </div>
                        {order.taxAmount > 0 && (
                            <div className="flex justify-between text-neutral-600">
                                <span className="font-medium">Tax</span>
                                <span className="font-semibold">${(order.taxAmount / 100).toFixed(2)}</span>
                            </div>
                        )}
                        {order.serviceFeeAmount > 0 && (
                            <div className="flex justify-between text-neutral-600">
                                <span className="font-medium">Service Fee</span>
                                <span className="font-semibold">${(order.serviceFeeAmount / 100).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-neutral-900 pt-4 border-t-2 border-neutral-800">
                            <span className="font-black text-xl uppercase tracking-widest">Total</span>
                            <span className="font-black text-xl">${(order.totalAmount / 100).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-24 pt-10 border-t-2 border-neutral-100 text-center text-sm text-neutral-400 font-medium">
                    <p>Thank you for your order! We appreciate your business.</p>
                    <p className="mt-2">For any questions regarding this invoice, please contact us at {phone}.</p>
                </div>

            </div>
        </main>
    );
}
