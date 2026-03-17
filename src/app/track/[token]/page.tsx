import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderTrackingCard from "./ui/OrderTrackingCard";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    const order = await prisma.order.findFirst({
        where: { chatToken: token },
        include: {
            items: true,
            messages: {
                orderBy: { createdAt: "asc" }
            }
        }
    });

    if (!order) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#0b0b0b] pb-20">
            <Navbar />
            <div className="pt-32 px-6 max-w-2xl mx-auto">
                <header className="mb-12 text-center">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest mb-4">
                        Order Live Tracker
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
                        #{order.id.slice(-6).toUpperCase()} Status
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">
                        Real-time updates directly from our kitchen.
                    </p>
                </header>

                <OrderTrackingCard order={JSON.parse(JSON.stringify(order))} />
            </div>
        </main>
    );
}
