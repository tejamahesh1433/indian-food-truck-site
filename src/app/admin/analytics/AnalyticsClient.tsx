"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = "today" | "week" | "month" | "allTime";

interface PeriodMetrics {
    revenue: number;
    orders: number;
    avgOrder: number;
    itemsSold: number;
    completedRevenue: number;
    cancellations: number;
    totalPlaced: number;
}

interface TopItem     { name: string; qty: number; revenueCents: number; pct: number }
interface StatusCount { status: string; count: number; pct: number }
interface DayData     { date: string; label: string; cents: number; orders: number }
interface PeakItem    { label: string; cents: number; orders: number; hour?: number; day?: number }

interface CateringMetrics {
    total: number;
    engaged: number;
    engagementRate: number;
    avgResponseTime: number;
    topTypes: { label: string; value: number }[];
}

interface PeriodEntry {
    curr: PeriodMetrics;
    prev: PeriodMetrics | null;
    topItems: TopItem[];
    statusCounts: StatusCount[];
    dateLabel: string;
    prevLabel: string | null;
    catering?: CateringMetrics;
}

interface Props {
    periodData: Record<Period, PeriodEntry>;
    dailyRevenue: (DayData & { catering?: number })[];
    peakHours: PeakItem[];
    peakWeekdays: PeakItem[];
    bestDay: { date: string; label: string; cents: number } | null;
    summary: {
        peakHour: string | null;
        peakDay: string | null;
        topItemName: string | null;
        activeDays30: number;
    };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<Period, string> = {
    today: "Today", week: "This Week", month: "This Month", allTime: "All Time",
};

const STATUS_COLORS: Record<string, string> = {
    PAID: "#22c55e", PREPARING: "#3b82f6", READY: "#f97316",
    COMPLETED: "#a855f7", CANCELLED: "#ef4444", PENDING: "#6b7280",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(cents: number) {
    return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Shows ↑18% / ↓5% / — when prev=0 / nothing when no prev
function ChangeBadge({ curr, prev }: { curr: number; prev: number | null | undefined }) {
    if (prev === null || prev === undefined) return null;
    if (prev === 0) return <span className="text-[9px] text-gray-600 font-bold">—</span>;

    const p = Math.round(((curr - prev) / prev) * 100);
    const up = p > 0, flat = p === 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full ${up ? "bg-green-500/10 text-green-400" : flat ? "bg-white/5 text-gray-500" : "bg-red-500/10 text-red-400"}`}>
            {!flat && (
                <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={up ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
            )}
            {Math.abs(p)}%
        </span>
    );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────

function BarChart({ data, view, bestDate }: { data: DayData[]; view: "revenue" | "orders"; bestDate: string | null }) {
    const vals = data.map(d => view === "revenue" ? d.cents : d.orders);
    const max = Math.max(...vals, 1);
    const showEvery = Math.max(1, Math.ceil(data.length / 7));
    const yTop = view === "revenue" ? fmt(max) : String(max);
    const yMid = view === "revenue" ? fmt(Math.round(max / 2)) : String(Math.round(max / 2));

    return (
        <div className="flex gap-3">
            <div className="flex flex-col justify-between pb-6 text-right w-14 flex-shrink-0">
                <span className="text-[9px] text-gray-600 font-bold">{yTop}</span>
                <span className="text-[9px] text-gray-600 font-bold">{yMid}</span>
                <span className="text-[9px] text-gray-600 font-bold">$0</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-end gap-[3px] h-40">
                    {data.map(d => {
                        const val = view === "revenue" ? d.cents : d.orders;
                        const isBest = d.date === bestDate && d.cents > 0;
                        const barStyle = {
                            height: `${Math.max((val / max) * 100, val > 0 ? 1.5 : 0)}%`,
                            background: isBest
                                ? "linear-gradient(to top, #d97706, #fbbf24)"
                                : val > 0
                                    ? "linear-gradient(to top, #ea580c, #f97316)"
                                    : "rgba(255,255,255,0.04)",
                            minHeight: val > 0 ? "3px" : "2px",
                        };
                        return (
                            <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative">
                                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                                    <div className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-[10px] whitespace-nowrap shadow-xl">
                                        <div className="font-black text-white mb-0.5">{d.label}</div>
                                        <div className="text-orange-400 font-bold">{fmt(d.cents)}</div>
                                        <div className="text-gray-500">{d.orders} order{d.orders !== 1 ? "s" : ""}</div>
                                        {isBest && <div className="text-yellow-400 font-bold mt-0.5">⭐ Best day</div>}
                                    </div>
                                    <div className="w-2 h-2 bg-zinc-900 border-r border-b border-white/10 rotate-45 -mt-1" />
                                </div>
                                {isBest && <span className="absolute -top-5 text-[10px]">⭐</span>}
                                <div className="w-full rounded-t-sm transition-all duration-300" style={barStyle} />
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-[3px] mt-2">
                    {data.map((d, i) => (
                        <div key={d.date} className="flex-1 text-center overflow-hidden">
                            {i % showEvery === 0 && <span className="text-[8px] text-gray-600 font-bold">{d.label}</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Horizontal Bars ─────────────────────────────────────────────────────────

function HBar({ items, view }: { items: PeakItem[]; view: "orders" | "revenue" }) {
    const vals = items.map(i => view === "revenue" ? i.cents : i.orders);
    const max = Math.max(...vals, 1);
    return (
        <div className="space-y-2">
            {items.map(item => {
                const val = view === "revenue" ? item.cents : item.orders;
                const barStyle = { 
                    width: `${(val / max) * 100}%`, 
                    background: val > 0 ? "linear-gradient(to right,#ea580c,#f97316)" : "transparent", 
                    minWidth: val > 0 ? "4px" : "0" 
                };
                return (
                    <div key={item.label} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-gray-400 w-9 text-right flex-shrink-0">{item.label}</span>
                        <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={barStyle} />
                        </div>
                        <div className="text-[10px] font-bold w-20 text-right flex-shrink-0">
                            {view === "revenue"
                                ? <span className="text-orange-400">{fmt(val)}</span>
                                : <span className="text-white">{val} {val === 1 ? "order" : "orders"}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Export CSV ──────────────────────────────────────────────────────────────

function exportCSV(daily: DayData[]) {
    const rows = [["Date", "Orders", "Revenue ($)"], ...daily.map(d => [d.label, String(d.orders), (d.cents / 100).toFixed(2)])];
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "sales-analytics.csv" });
    a.click(); URL.revokeObjectURL(a.href);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsClient({ periodData, dailyRevenue, peakHours, peakWeekdays, bestDay, summary }: Props) {
    const [view, setView]           = useState<"sales" | "catering">("sales");
    const [period, setPeriod]       = useState<Period>("month");
    const [chartView, setChartView] = useState<"revenue" | "orders">("revenue");
    const [peakView, setPeakView]   = useState<"orders" | "revenue">("orders");

    const { curr, prev, topItems, statusCounts, dateLabel, prevLabel, catering } = periodData[period];
    const cancelRate = curr.totalPlaced > 0 ? Math.round((curr.cancellations / curr.totalPlaced) * 100) : 0;

    const businessHours = peakHours.filter(h => (h.hour ?? 0) >= 6 && (h.hour ?? 0) <= 23);
    const sortedDays    = [...peakWeekdays].sort((a, b) => (((a.day ?? 0) + 6) % 7) - (((b.day ?? 0) + 6) % 7));

    const statCards = [
        {
            label: "Revenue", value: fmt(curr.revenue), currVal: curr.revenue, prevVal: prev?.revenue,
            prevFmt: prev && prev.revenue > 0 ? `was ${fmt(prev.revenue)}` : undefined,
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        },
        {
            label: "Orders", value: String(curr.orders), currVal: curr.orders, prevVal: prev?.orders,
            prevFmt: prev && prev.orders > 0 ? `was ${prev.orders}` : undefined,
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
        },
        {
            label: "Avg Order", value: fmt(curr.avgOrder), currVal: curr.avgOrder, prevVal: prev?.avgOrder,
            prevFmt: prev && prev.avgOrder > 0 ? `was ${fmt(prev.avgOrder)}` : undefined,
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        },
        {
            label: "Items Sold", value: String(curr.itemsSold), currVal: curr.itemsSold, prevVal: prev?.itemsSold,
            prevFmt: prev && prev.itemsSold > 0 ? `was ${prev.itemsSold}` : undefined,
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                {(["sales", "catering"] as const).map(v => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            view === v ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        {v === "sales" ? "🛒 Sales Overview" : "🍢 Catering Insights"}
                    </button>
                ))}
            </div>

            <div className="space-y-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex gap-2 flex-wrap">
                            {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                                <button key={p} onClick={() => setPeriod(p)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition ${
                                        period === p ? "bg-white text-black" : "bg-white/5 text-gray-400 border border-white/10"
                                    }`}>
                                    {PERIOD_LABELS[p]}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2 ml-0.5">{dateLabel}</p>
                    </div>
                    <button onClick={() => exportCSV(dailyRevenue as any)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-xs font-bold text-gray-400 hover:text-white flex-shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                    </button>
                </div>

                {view === "sales" && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {statCards.map(card => (
                                <div key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 flex-shrink-0">
                                            {card.icon}
                                        </div>
                                        <ChangeBadge curr={card.currVal} prev={card.prevVal} />
                                    </div>
                                    <div className="text-2xl font-black text-white leading-none mb-1">{card.value}</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{card.label}</div>
                                    {card.prevFmt && (
                                        <div className="text-[9px] text-gray-600 mt-1">{card.prevFmt} · {prevLabel}</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: "Best Day (30d)", value: bestDay ? bestDay.label : "—", sub: bestDay ? fmt(bestDay.cents) : "No sales yet", icon: "⭐" },
                                { label: "Cancel Rate", value: `${cancelRate}%`, sub: `${curr.cancellations} of ${curr.totalPlaced} orders`, icon: "✕", warn: cancelRate > 10 },
                                { label: "Peak Hour", value: summary.peakHour ?? "—", sub: "last 30 days", icon: "🕐" },
                                { label: "Peak Day", value: summary.peakDay ?? "—", sub: "last 30 days", icon: "📅" },
                            ].map(card => (
                                <div key={card.label} className={`rounded-2xl border bg-white/5 p-4 flex items-center gap-3 ${card.warn ? "border-red-500/20" : "border-white/10"}`}>
                                    <span className="text-lg flex-shrink-0">{card.icon}</span>
                                    <div className="min-w-0">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-0.5">{card.label}</div>
                                        <div className={`font-black text-base leading-none ${card.warn ? "text-red-400" : "text-white"}`}>{card.value}</div>
                                        <div className="text-[9px] text-gray-600 mt-0.5">{card.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <div className="font-semibold text-white">Daily Trend</div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        Last 30 days ·{" "}
                                        <span className={summary.activeDays30 > 0 ? "text-orange-400 font-bold" : "text-gray-600"}>
                                            {summary.activeDays30} active {summary.activeDays30 === 1 ? "day" : "days"}
                                        </span>
                                        {bestDay && <span className="text-gray-500"> · best: {bestDay.label} ({fmt(bestDay.cents)})</span>}
                                    </div>
                                </div>
                                <div className="flex rounded-xl border border-white/10 overflow-hidden text-[10px] font-bold uppercase tracking-widest flex-shrink-0">
                                    {(["revenue", "orders"] as const).map(v => (
                                        <button key={v} onClick={() => setChartView(v)}
                                            className={`px-3 py-1.5 transition ${chartView === v ? "bg-orange-500/20 text-orange-500" : "text-gray-500 hover:text-gray-400"}`}>
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <BarChart data={dailyRevenue} view={chartView} bestDate={bestDay?.date ?? null} />
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <div className="mb-5">
                                <div className="font-semibold text-white">Top Selling Items</div>
                                <div className="text-xs text-gray-500 mt-0.5">{PERIOD_LABELS[period]} · by quantity</div>
                            </div>
                            {topItems.length === 0 ? (
                                <p className="text-sm text-gray-600">No orders in this period.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                {["#", "Item", "Qty", "Revenue", "% of Sales"].map((h, i) => (
                                                    <th key={h} className={`text-[9px] font-black uppercase tracking-widest text-gray-600 pb-3 ${i === 0 ? "text-left w-5 pr-3" : i === 1 ? "text-left" : "text-right px-3"}`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topItems.map((item, i) => (
                                                <tr key={item.name} className="border-b border-white/5 hover:bg-white/5 transition">
                                                    <td className="py-2.5 pr-3 text-gray-600 font-black text-xs">{i + 1}</td>
                                                    <td className="py-2.5">
                                                        <div className="font-bold text-white text-sm">{item.name}</div>
                                                        <div className="mt-1 h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: i === 0 ? "linear-gradient(to right,#ea580c,#f97316)" : "rgba(249,115,22,0.3)" }} />
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-black text-white">{item.qty}</td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-orange-400">{fmt(item.revenueCents)}</td>
                                                    <td className="py-2.5 pl-3 text-right">
                                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">{item.pct}%</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                            <div className="font-semibold text-white mb-1">Order Breakdown</div>
                            <div className="text-xs text-gray-500 mb-5">{PERIOD_LABELS[period]} · {curr.totalPlaced} total placed</div>
                            {statusCounts.length === 0 ? (
                                <p className="text-sm text-gray-600">No orders in this period.</p>
                            ) : (
                                <div className="space-y-3">
                                    {statusCounts.map(({ status, count, pct }) => {
                                        const barStyle = { width: `${pct}%`, background: STATUS_COLORS[status] ?? "#6b7280", opacity: 0.7 };
                                        return (
                                            <div key={status} className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[status] ?? "#6b7280" }} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-24 flex-shrink-0">{status}</span>
                                                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-500" style={barStyle} />
                                                </div>
                                                <span className="text-[10px] font-black text-white w-6 text-right flex-shrink-0">{count}</span>
                                                <span className="text-[9px] text-gray-600 font-bold w-8 text-right flex-shrink-0">{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <div className="font-semibold text-white">Peak Hours</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Last 30 days
                                            {summary.peakHour && <span className="text-orange-400 font-bold"> · busiest: {summary.peakHour}</span>}
                                        </div>
                                    </div>
                                    <div className="flex rounded-xl border border-white/10 overflow-hidden text-[9px] font-bold uppercase tracking-widest flex-shrink-0">
                                        {(["orders", "revenue"] as const).map(v => (
                                            <button key={v} onClick={() => setPeakView(v)}
                                                className={`px-2.5 py-1.5 transition ${peakView === v ? "bg-orange-500/20 text-orange-500" : "text-gray-500 hover:text-gray-400"}`}>
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {businessHours.every(h => h.orders === 0)
                                    ? <p className="text-sm text-gray-600">No data yet.</p>
                                    : <HBar items={businessHours} view={peakView} />}
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                <div className="mb-5">
                                    <div className="font-semibold text-white">Peak Days</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Last 30 days
                                        {summary.peakDay && <span className="text-orange-400 font-bold"> · busiest: {summary.peakDay}</span>}
                                    </div>
                                </div>
                                {sortedDays.every(d => d.orders === 0)
                                    ? <p className="text-sm text-gray-600">No data yet.</p>
                                    : <HBar items={sortedDays} view={peakView} />}
                            </div>
                        </div>
                    </>
                )}

                {view === "catering" && catering && (
                    <>
                        {/* ── Metrics ─────────────────────────────────────── */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-white/10" />
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                                    <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                    </div>
                                    Total Requests
                                </div>
                                <div className="text-6xl font-black text-white tracking-tighter">{catering.total}</div>
                                <div className="text-xs text-gray-600 mt-2 font-bold italic tracking-tighter uppercase">{PERIOD_LABELS[period]}</div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-blue-500/10" />
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                                    <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    Engagement Rate
                                </div>
                                <div className="text-6xl font-black text-blue-400 tracking-tighter">{catering.engagementRate}%</div>
                                <div className="mt-4 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000" style={{ width: `${catering.engagementRate}%` }} />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-orange-500/10" />
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                                    <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    Avg Response
                                </div>
                                <div className="text-6xl font-black text-orange-400 tracking-tighter">{catering.avgResponseTime}<span className="text-3xl ml-1 text-orange-400/50">h</span></div>
                                <div className="text-xs text-gray-600 mt-2 font-bold uppercase tracking-widest">Time to first reply</div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-10">
                            <div className="mb-10">
                                <div className="text-2xl font-bold text-white">Request Volume</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-black mt-1">Catering leads over the last 30 days</div>
                            </div>
                            <div className="h-64 flex items-end gap-1.5">
                                {dailyRevenue.map((d) => {
                                    const max = Math.max(...dailyRevenue.map(v => v.catering || 0), 1);
                                    const h = d.catering ? (d.catering / max) * 100 : 0;
                                    return (
                                        <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-zinc-900 border border-white/10 px-2 py-1 rounded text-[10px] whitespace-nowrap z-20">
                                                {d.label}: {d.catering} requests
                                            </div>
                                            <div 
                                                className="w-full bg-blue-500/20 hover:bg-blue-500 transition-all rounded-t-sm" 
                                                style={{ height: `${h}%`, minHeight: d.catering ? "4px" : "0" }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-10">
                            <div className="mb-8">
                                <div className="text-2xl font-bold text-white">Event Type Distribution</div>
                                <div className="text-xs text-gray-500 uppercase tracking-widest font-black mt-1">Which niches are driving requests</div>
                            </div>
                            <div className="space-y-6">
                                {catering.topTypes.map((type) => {
                                    const pct = Math.round((type.value / (catering.total || 1)) * 100);
                                    return (
                                        <div key={type.label} className="flex items-center gap-6">
                                            <div className="w-32 text-xs font-black uppercase tracking-widest text-gray-400 truncate">{type.label}</div>
                                            <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="w-16 text-right text-sm font-black text-white">{type.value}</div>
                                            <div className="w-12 text-right text-[10px] font-bold text-gray-500 italic tracking-tighter">{pct}%</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
