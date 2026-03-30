import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";

function startOf(unit: "day" | "week" | "month" | "year") {
    const now = new Date();
    if (unit === "day") {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    if (unit === "week") {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        d.setDate(d.getDate() - d.getDay()); // Sunday
        return d;
    }
    if (unit === "month") {
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return new Date(now.getFullYear(), 0, 1);
}

export default async function AnalyticsPage() {
    const PAID_STATUSES = ["PAID", "PREPARING", "READY", "COMPLETED"];

    // Revenue windows
    const [todayOrders, weekOrders, monthOrders, allOrders] = await Promise.all([
        prisma.order.findMany({
            where: { status: { in: PAID_STATUSES }, createdAt: { gte: startOf("day") } },
            include: { items: true },
        }),
        prisma.order.findMany({
            where: { status: { in: PAID_STATUSES }, createdAt: { gte: startOf("week") } },
            include: { items: true },
        }),
        prisma.order.findMany({
            where: { status: { in: PAID_STATUSES }, createdAt: { gte: startOf("month") } },
            include: { items: true },
        }),
        prisma.order.findMany({
            where: { status: { in: PAID_STATUSES } },
            include: { items: true },
            orderBy: { createdAt: "asc" },
        }),
    ]);

    const sum = (orders: typeof allOrders) =>
        orders.reduce((acc, o) => acc + o.totalAmount, 0);

    // Top selling items (all-time by quantity)
    const itemMap: Record<string, { name: string; qty: number; revenueCents: number }> = {};
    for (const order of allOrders) {
        for (const item of order.items) {
            if (!itemMap[item.name]) itemMap[item.name] = { name: item.name, qty: 0, revenueCents: 0 };
            itemMap[item.name].qty += item.quantity;
            itemMap[item.name].revenueCents += item.priceCents * item.quantity;
        }
    }
    const topItems = Object.values(itemMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 8);

    // Daily revenue for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const last30Orders = allOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        dailyMap[key] = 0;
    }
    for (const order of last30Orders) {
        const key = new Date(order.createdAt).toISOString().slice(0, 10);
        if (key in dailyMap) dailyMap[key] += order.totalAmount;
    }
    const dailyRevenue = Object.entries(dailyMap).map(([date, cents]) => ({
        date,
        label: new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        cents,
    }));

    // Order status breakdown
    const statusCounts = await prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
    });

    const stats = {
        today: { revenue: sum(todayOrders), orders: todayOrders.length },
        week: { revenue: sum(weekOrders), orders: weekOrders.length },
        month: { revenue: sum(monthOrders), orders: monthOrders.length },
        allTime: { revenue: sum(allOrders), orders: allOrders.length },
    };

    return (
        <main className="mx-auto max-w-5xl px-6 py-12">
            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
                <div>
                    <Link
                        href="/admin"
                        className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-orange-500 transition flex items-center gap-1.5 mb-3 group"
                    >
                        <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Dashboard
                    </Link>
                    <h1 className="text-3xl font-semibold">Sales Analytics</h1>
                    <p className="mt-1 text-sm text-gray-400">Revenue, order trends, and top-selling items.</p>
                </div>
            </div>

            <AnalyticsClient
                stats={stats}
                topItems={topItems}
                dailyRevenue={dailyRevenue}
                statusCounts={statusCounts.map(s => ({ status: s.status, count: s._count.id }))}
            />
        </main>
    );
}
