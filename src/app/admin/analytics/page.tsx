import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";

const PAID: OrderStatus[] = ["PAID", "PREPARING", "READY", "COMPLETED"];

type OrderFull = {
    totalAmount: number;
    status: string;
    createdAt: Date;
    items: { quantity: number; priceCents: number; name: string }[];
};
type OrderLite = { status: string; createdAt: Date };

function between<T extends { createdAt: Date }>(arr: T[], start: Date, end?: Date): T[] {
    return arr.filter(o => { const d = new Date(o.createdAt); return d >= start && (!end || d < end); });
}

function computeMetrics(paid: OrderFull[], all: OrderLite[]) {
    const revenue       = paid.reduce((s, o) => s + o.totalAmount, 0);
    const count         = paid.length;
    const itemsSold     = paid.reduce((s, o) => s + o.items.reduce((is, i) => is + i.quantity, 0), 0);
    const completedRev  = paid.filter(o => o.status === "COMPLETED").reduce((s, o) => s + o.totalAmount, 0);
    const cancellations = all.filter(o => o.status === "CANCELLED").length;
    const totalPlaced   = all.length;
    return { revenue, orders: count, avgOrder: count > 0 ? Math.round(revenue / count) : 0, itemsSold, completedRevenue: completedRev, cancellations, totalPlaced };
}

function topItemsFor(orders: OrderFull[]) {
    const map: Record<string, { name: string; qty: number; revenueCents: number }> = {};
    for (const o of orders) for (const item of o.items) {
        if (!map[item.name]) map[item.name] = { name: item.name, qty: 0, revenueCents: 0 };
        map[item.name].qty += item.quantity;
        map[item.name].revenueCents += item.priceCents * item.quantity;
    }
    const total = Object.values(map).reduce((s, i) => s + i.qty, 0);
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 10)
        .map(item => ({ ...item, pct: total > 0 ? Math.round((item.qty / total) * 100) : 0 }));
}

function statusCountsFor(orders: OrderLite[]) {
    const map: Record<string, number> = {};
    for (const o of orders) map[o.status] = (map[o.status] || 0) + 1;
    const total = orders.length;
    return Object.entries(map)
        .map(([status, count]) => ({ status, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
        .sort((a, b) => b.count - a.count);
}

function mkPeriod(
    currPaid: OrderFull[], currAll: OrderLite[], dateLabel: string, prevLabel: string | null,
    prevPaid?: OrderFull[], prevAll?: OrderLite[]
) {
    return {
        curr: computeMetrics(currPaid, currAll),
        prev: prevPaid !== undefined ? computeMetrics(prevPaid, prevAll ?? []) : null,
        topItems: topItemsFor(currPaid),
        statusCounts: statusCountsFor(currAll),
        dateLabel,
        prevLabel,
    };
}

function fmtDate(d: Date, opts: Intl.DateTimeFormatOptions) {
    return d.toLocaleDateString("en-US", opts);
}

function formatHour(h: number): string {
    if (h === 0) return "12am"; if (h < 12) return `${h}am`; if (h === 12) return "12pm"; return `${h - 12}pm`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function AnalyticsPage() {
    const now = new Date();
    const SHORT: Intl.DateTimeFormatOptions      = { month: "short", day: "numeric" };
    const SHORT_YEAR: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    const WKDAY_YEAR: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric", year: "numeric" };

    // ─── Boundaries ──────────────────────────────────────────────────────────
    const todayStart      = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart  = new Date(todayStart);  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const dow             = now.getDay();
    const weekStart       = new Date(todayStart); weekStart.setDate(weekStart.getDate() - dow);
    const lastWeekStart   = new Date(weekStart);  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const monthStart      = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd    = new Date(monthStart);



    // ─── Fetch ───────────────────────────────────────────────────────────────
    // Bound the all-time queries to the last 12 months to avoid a full table scan.
    // Anything older than a year has negligible impact on the displayed periods.
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const [allPaid, allLite, allCatering] = await Promise.all([
        prisma.order.findMany({ where: { status: { in: PAID }, createdAt: { gte: oneYearAgo } }, include: { items: { select: { quantity: true, priceCents: true, name: true } } }, orderBy: { createdAt: "asc" } }) as Promise<OrderFull[]>,
        prisma.order.findMany({ where: { createdAt: { gte: oneYearAgo } }, select: { status: true, createdAt: true }, orderBy: { createdAt: "asc" } }) as Promise<OrderLite[]>,
        prisma.cateringRequest.findMany({ where: { createdAt: { gte: oneYearAgo } }, include: { messages: { where: { sender: "ADMIN" }, orderBy: { createdAt: "asc" }, take: 1 } }, orderBy: { createdAt: "asc" } }),
    ]);

    // ─── Catering Logic ──────────────────────────────────────────────────────
    function computeCateringMetrics(requests: typeof allCatering) {
        const total = requests.length;
        const engaged = requests.filter(r => r.status !== "NEW").length;
        const engagementRate = total > 0 ? Math.round((engaged / total) * 100) : 0;
        
        // Calculate Avg Response Time in Hours
        const responseTimes = requests
            .filter(r => r.messages.length > 0)
            .map(r => {
                const firstAdminMsg = r.messages[0];
                return (new Date(firstAdminMsg.createdAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
            });
        
        const avgResponseTime = responseTimes.length > 0 
            ? Math.round((responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length) * 10) / 10 
            : 0;

        // Top Types
        const typeMap: Record<string, number> = {};
        for (const r of requests as any[]) {
            const t = r.type || "Other";
            typeMap[t] = (typeMap[t] || 0) + 1;
        }
        const topTypes = Object.entries(typeMap)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

        return { total, engaged, engagementRate, avgResponseTime, topTypes };
    }

    // ─── Cached slices ───────────────────────────────────────────────────────
    const slices = {
        today:      { paid: between(allPaid, todayStart),                     all: between(allLite, todayStart),                   catering: between(allCatering, todayStart) },
        yesterday:  { paid: between(allPaid, yesterdayStart, todayStart),     all: between(allLite, yesterdayStart, todayStart),   catering: between(allCatering, yesterdayStart, todayStart) },
        thisWeek:   { paid: between(allPaid, weekStart),                      all: between(allLite, weekStart),                    catering: between(allCatering, weekStart) },
        lastWeek:   { paid: between(allPaid, lastWeekStart, weekStart),       all: between(allLite, lastWeekStart, weekStart),     catering: between(allCatering, lastWeekStart, weekStart) },
        thisMonth:  { paid: between(allPaid, monthStart),                     all: between(allLite, monthStart),                   catering: between(allCatering, monthStart) },
        lastMonth:  { paid: between(allPaid, lastMonthStart, lastMonthEnd),   all: between(allLite, lastMonthStart, lastMonthEnd), catering: between(allCatering, lastMonthStart, lastMonthEnd) },
    };

    // ─── Date labels ─────────────────────────────────────────────────────────
    const lastWeekEndDate   = new Date(weekStart);      lastWeekEndDate.setDate(lastWeekEndDate.getDate() - 1);
    const lastMonthEndDate  = new Date(lastMonthEnd);   lastMonthEndDate.setDate(lastMonthEndDate.getDate() - 1);


    // ─── Period data ─────────────────────────────────────────────────────────
    const periodData = {
        today:   { 
            ...mkPeriod(slices.today.paid,     slices.today.all,     fmtDate(now, WKDAY_YEAR),                                                               `vs ${fmtDate(yesterdayStart, SHORT)}`,                                                   slices.yesterday.paid, slices.yesterday.all),
            catering: computeCateringMetrics(slices.today.catering as typeof allCatering)
        },
        week:    { 
            ...mkPeriod(slices.thisWeek.paid,  slices.thisWeek.all,  `${fmtDate(weekStart, SHORT)} – ${fmtDate(now, SHORT_YEAR)}`,                           `vs ${fmtDate(lastWeekStart, SHORT)} – ${fmtDate(lastWeekEndDate, SHORT)}`,               slices.lastWeek.paid, slices.lastWeek.all),
            catering: computeCateringMetrics(slices.thisWeek.catering as typeof allCatering)
        },
        month:   { 
            ...mkPeriod(slices.thisMonth.paid, slices.thisMonth.all, `${fmtDate(monthStart, SHORT)} – ${fmtDate(now, SHORT_YEAR)}`,                          `vs ${fmtDate(lastMonthStart, SHORT)} – ${fmtDate(lastMonthEndDate, SHORT)}`,             slices.lastMonth.paid, slices.lastMonth.all),
            catering: computeCateringMetrics(slices.thisMonth.catering as typeof allCatering)
        },

        allTime: {
            ...mkPeriod(allPaid,               allLite,              "All Time",                                                                              null),
            catering: computeCateringMetrics(allCatering)
        },
    };

    // ─── Daily revenue + catering volume (last 30 days) ──────────────────────
    const thirtyAgo = new Date(todayStart); thirtyAgo.setDate(thirtyAgo.getDate() - 29);
    const dailyMap: Record<string, { cents: number; orders: number; catering: number }> = {};
    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyAgo); d.setDate(d.getDate() + i);
        dailyMap[d.toISOString().slice(0, 10)] = { cents: 0, orders: 0, catering: 0 };
    }
    for (const o of between(allPaid, thirtyAgo)) {
        const k = new Date(o.createdAt).toISOString().slice(0, 10);
        if (k in dailyMap) { dailyMap[k].cents += o.totalAmount; dailyMap[k].orders++; }
    }
    for (const r of between(allCatering, thirtyAgo)) {
        const k = new Date(r.createdAt).toISOString().slice(0, 10);
        if (k in dailyMap) { dailyMap[k].catering++; }
    }
    const dailyRevenue = Object.entries(dailyMap).map(([date, d]) => ({
        date,
        label: new Date(date + "T12:00:00").toLocaleDateString("en-US", SHORT),
        cents: d.cents,
        orders: d.orders,
        catering: d.catering,
    }));
    const activeDays30 = dailyRevenue.filter((d: { orders: number }) => d.orders > 0).length;
    const bestDay30 = [...dailyRevenue].sort((a, b) => b.cents - a.cents)[0];
    const bestDay = bestDay30?.cents > 0 ? { date: bestDay30.date, label: bestDay30.label, cents: bestDay30.cents } : null;

    // ─── Peak hours + days (last 30 days) ────────────────────────────────────
    const recentPaid = between(allPaid, thirtyAgo);
    const hourMap: Record<number, { cents: number; orders: number }> = {};
    const dayMap: Record<number, { cents: number; orders: number }> = {};
    for (let h = 0; h < 24; h++) hourMap[h] = { cents: 0, orders: 0 };
    for (let d = 0; d < 7; d++) dayMap[d] = { cents: 0, orders: 0 };
    for (const o of recentPaid) {
        const h = new Date(o.createdAt).getHours();
        const d = new Date(o.createdAt).getDay();
        hourMap[h].cents += o.totalAmount; hourMap[h].orders++;
        dayMap[d].cents  += o.totalAmount; dayMap[d].orders++;
    }
    const peakHours    = Object.entries(hourMap).map(([h, d]) => ({ hour: Number(h),  label: formatHour(Number(h)),   ...d }));
    const peakWeekdays = Object.entries(dayMap).map(([d, data]) => ({ day: Number(d), label: DAY_NAMES[Number(d)],    ...data }));

    // ─── Quick insight summaries ──────────────────────────────────────────────
    const topHour    = peakHours.reduce((best, h) => h.orders > best.orders ? h : best, peakHours[0]);
    const topDay     = peakWeekdays.reduce((best, d) => d.orders > best.orders ? d : best, peakWeekdays[0]);
    const topItemAll = topItemsFor(allPaid)[0] ?? null;

    const summary = {
        peakHour:    topHour?.orders > 0 ? topHour.label : null,
        peakDay:     topDay?.orders > 0 ? topDay.label : null,
        topItemName: topItemAll?.name ?? null,
        activeDays30,
    };

    return (
        <main className="mx-auto max-w-5xl px-6 py-12">
            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
                <div>
                    <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-orange-500 transition flex items-center gap-1.5 mb-3 group">
                        <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Dashboard
                    </Link>
                    <h1 className="text-3xl font-semibold">Sales Analytics</h1>
                    <p className="mt-1 text-sm text-gray-400">Revenue trends, top items, and peak hours.</p>
                </div>
            </div>

            <AnalyticsClient
                periodData={periodData}
                dailyRevenue={dailyRevenue}
                peakHours={peakHours}
                peakWeekdays={peakWeekdays}
                bestDay={bestDay}
                summary={summary}
            />
        </main>
    );
}
