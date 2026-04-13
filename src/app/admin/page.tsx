import { prisma } from "@/lib/prisma";
import AdminOrdersClient from "./AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    // Fetch all active/recent orders. Since completed/cancelled orders can be many,
    // we limit to recent ones for the POS view, or just fetch the ones from today.
    // For simplicity, we'll fetch the last 100 orders or those from the last 24h.
    
    // Actually, let's fetch all active orders (PAID, PREPARING, READY) 
    // and the last 50 COMPLETED/CANCELLED orders.
    
    const activeOrders = await prisma.order.findMany({
        where: {
            status: {
                in: ["PENDING", "PAID", "PREPARING", "READY"]
            }
        },
        orderBy: { createdAt: "asc" }, // Oldest first
        include: { items: true }
    });

    const recentInactiveOrders = await prisma.order.findMany({
        where: {
            status: {
                in: ["COMPLETED", "CANCELLED"]
            }
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { items: true }
    });
    
    // Sort all orders so oldest is first (left) and newest is last (right)
    const orders = [...activeOrders, ...recentInactiveOrders].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return <AdminOrdersClient initialOrders={orders} />;
}
