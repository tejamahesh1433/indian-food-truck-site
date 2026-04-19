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
            label: "Total Orders",
            value: totalOrders,
            color: "from-blue-500/20 to-blue-600/10 border-blue-500/20",
        },
        {
            icon: "✅",
            label: "Completed",
            value: completedOrders,
            color: "from-green-500/20 to-green-600/10 border-green-500/20",
        },
        {
            icon: "💰",
            label: "Total Spent",
            value: `$${(totalSpent / 100).toFixed(2)}`,
            color: "from-orange-500/20 to-orange-600/10 border-orange-500/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-6`}
                >
                    <div className="text-3xl mb-3">{stat.icon}</div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                        {stat.label}
                    </p>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                </div>
            ))}
        </div>
    );
}
