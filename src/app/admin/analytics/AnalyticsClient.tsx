"use client";

import { useState } from "react";

type Period = "today" | "week" | "month" | "allTime";

interface Stats {
    today: { revenue: number; orders: number };
    week: { revenue: number; orders: number };
    month: { revenue: number; orders: number };
    allTime: { revenue: number; orders: number };
}

interface TopItem {
    name: string;
    qty: number;
    revenueCents: number;
}

interface DailyRevenue {
    date: string;
    label: string;
    cents: number;
}

interface StatusCount {
    status: string;
    count: number;
}

interface Props {
    stats: Stats;
    topItems: TopItem[];
    dailyRevenue: DailyRevenue[];
    statusCounts: StatusCount[];
}

const periodLabels: Record<Period, string> = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    allTime: "All Time",
};

const statusColors: Record<string, string> = {
    PAID: "#22c55e",
    PREPARING: "#3b82f6",
    READY: "#f97316",
    COMPLETED: "#a855f7",
    CANCELLED: "#ef4444",
    PENDING: "#6b7280",
};

function fmt(cents: number) {
    return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function BarChart({ data }: { data: DailyRevenue[] }) {
    const max = Math.max(...data.map(d => d.cents), 1);
    // Show every 5th label to avoid crowding
    const showEvery = Math.ceil(data.length / 6);

    return (
        <div className="w-full">
            <div className="flex items-end gap-[3px] h-40">
                {data.map((d, i) => {
                    const heightPct = (d.cents / max) * 100;
                    return (
                        <div
                            key={d.date}
                            className="flex-1 flex flex-col items-center justify-end group relative"
                            title={`${d.label}: ${fmt(d.cents)}`}
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                                <div className="bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap shadow-xl">
                                    <div className="font-bold text-white">{fmt(d.cents)}</div>
                                    <div className="text-gray-400">{d.label}</div>
                                </div>
                                <div className="w-2 h-2 bg-zinc-800 border-r border-b border-white/10 rotate-45 -mt-1" />
                            </div>
                            <div
                                className="w-full rounded-t-sm transition-all duration-300"
                                style={{
                                    height: `${Math.max(heightPct, d.cents > 0 ? 2 : 0)}%`,
                                    background: d.cents > 0
                                        ? "linear-gradient(to top, #ea580c, #f97316)"
                                        : "rgba(255,255,255,0.05)",
                                    minHeight: d.cents > 0 ? "4px" : "2px",
                                }}
                            />
                        </div>
                    );
                })}
            </div>
            {/* X-axis labels */}
            <div className="flex gap-[3px] mt-2">
                {data.map((d, i) => (
                    <div key={d.date} className="flex-1 text-center">
                        {i % showEvery === 0 && (
                            <span className="text-[8px] text-gray-600 font-bold">{d.label}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AnalyticsClient({ stats, topItems, dailyRevenue, statusCounts }: Props) {
    const [period, setPeriod] = useState<Period>("month");
    const current = stats[period];
    const maxQty = Math.max(...topItems.map(i => i.qty), 1);

    return (
        <div className="space-y-8">
            {/* Period Tabs */}
            <div className="flex gap-2 flex-wrap">
                {(Object.keys(periodLabels) as Period[]).map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition ${
                            period === p
                                ? "bg-orange-500 text-black"
                                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                        }`}
                    >
                        {periodLabels[p]}
                    </button>
                ))}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Revenue</div>
                    <div className="text-3xl font-black text-orange-500">{fmt(current.revenue)}</div>
                    <div className="text-xs text-gray-500 mt-1">{periodLabels[period]}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Orders</div>
                    <div className="text-3xl font-black text-white">{current.orders}</div>
                    <div className="text-xs text-gray-500 mt-1">{periodLabels[period]}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 col-span-2 sm:col-span-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Avg Order</div>
                    <div className="text-3xl font-black text-white">
                        {current.orders > 0 ? fmt(Math.round(current.revenue / current.orders)) : "$0.00"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{periodLabels[period]}</div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="font-semibold text-white">Daily Revenue</div>
                        <div className="text-xs text-gray-500 mt-0.5">Last 30 days</div>
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Hover bars for details</div>
                </div>
                <BarChart data={dailyRevenue} />
            </div>

            {/* Top Selling Items */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="font-semibold text-white mb-6">Top Selling Items</div>
                <div className="space-y-3">
                    {topItems.length === 0 ? (
                        <p className="text-sm text-gray-500">No orders yet.</p>
                    ) : (
                        topItems.map((item, i) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-600 w-4 text-right">{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-white truncate">{item.name}</span>
                                        <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{item.qty} sold</span>
                                            <span className="text-xs font-bold text-orange-400">{fmt(item.revenueCents)}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(item.qty / maxQty) * 100}%`,
                                                background: i === 0
                                                    ? "linear-gradient(to right, #ea580c, #f97316)"
                                                    : "rgba(249,115,22,0.4)",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="font-semibold text-white mb-6">Order Status Breakdown <span className="text-xs text-gray-500 font-normal">(all-time)</span></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {statusCounts
                        .sort((a, b) => b.count - a.count)
                        .map(({ status, count }) => (
                            <div
                                key={status}
                                className="rounded-xl border border-white/5 bg-white/5 p-4 flex items-center gap-3"
                            >
                                <div
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ background: statusColors[status] ?? "#6b7280" }}
                                />
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400">{status}</div>
                                    <div className="text-xl font-black text-white">{count}</div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
