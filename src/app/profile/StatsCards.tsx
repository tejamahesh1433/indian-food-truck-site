"use client";

interface StatsCardsProps {
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    memberSince: string;
}

export default function StatsCards({
    totalOrders,
    completedOrders,
    totalSpent,
}: StatsCardsProps) {
    const stats = [
        {
            icon: "📦",
            label: "Orders",
            value: totalOrders,
            color: "from-blue-500/20 to-blue-600/10 border-blue-500/20",
        },
        {
            icon: "✅",
            label: "Done",
            value: completedOrders,
            color: "from-green-500/20 to-green-600/10 border-green-500/20",
        },
        {
            icon: "💰",
            label: "Spent",
            value: `$${(totalSpent / 100).toFixed(2)}`,
            color: "from-orange-500/20 to-orange-600/10 border-orange-500/20",
        },
    ];

    return (
        /* On mobile: equal-width 3-column row that fits the screen */
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className={`bg-gradient-to-br ${stat.color} border rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center sm:text-left`}
                >
                    <div className="text-xl sm:text-3xl mb-1 sm:mb-3">{stat.icon}</div>
                    <p className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5 sm:mb-1 leading-tight">
                        {stat.label}
                    </p>
                    <p className="text-base sm:text-2xl font-black text-white leading-tight">
                        {stat.value}
                    </p>
                </div>
            ))}
        </div>
    );
}
