import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const dateFrom = req.nextUrl.searchParams.get("from");
        const dateTo = req.nextUrl.searchParams.get("to");

        const where: Prisma.CateringRequestWhereInput = {};
        
        if (dateFrom || dateTo) {
            const dateFilter: Prisma.DateTimeFilter = {};
            if (dateFrom) dateFilter.gte = new Date(dateFrom);
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                dateFilter.lte = endDate;
            }
            where.createdAt = dateFilter;
        }

        // Get all catering requests
        const requests = await prisma.cateringRequest.findMany({
            where,
            include: { messages: true },
        });

        // Calculate analytics
        const statusBreakdown = {
            NEW: requests.filter((r) => r.status === "NEW").length,
            QUOTED: requests.filter((r) => r.status === "QUOTED").length,
            CONFIRMED: requests.filter((r) => r.status === "CONFIRMED").length,
            COMPLETED: requests.filter((r) => r.status === "COMPLETED").length,
            REJECTED: requests.filter((r) => r.status === "REJECTED").length,
        };

        // Calculate conversion rate
        const newToConfirmed = requests.filter((r) => r.status === "CONFIRMED").length;
        const conversionRate = requests.length > 0 ? (newToConfirmed / requests.length) * 100 : 0;

        // Calculate average response time
        const responseTimes = requests
            .map((r) => {
                const customerMessage = r.messages.find((m) => m.sender === "CUSTOMER");
                const adminResponse = r.messages.find((m) => m.sender === "ADMIN");
                if (customerMessage && adminResponse && adminResponse.createdAt > customerMessage.createdAt) {
                    return (
                        (adminResponse.createdAt.getTime() - customerMessage.createdAt.getTime()) /
                        (1000 * 60 * 60)
                    ); // in hours
                }
                return null;
            })
            .filter((t) => t !== null) as number[];

        const avgResponseTime =
            responseTimes.length > 0
                ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
                : "N/A";

        // Estimate value (based on average catering prices if available)
        const estimatedValue = requests.reduce((sum, r) => {
            // Try to estimate from selections JSON
            try {
                if (r.selections && typeof r.selections === "object") {
                    // Rough estimate: $15-30 per person
                    const guests = parseInt(r.guests || "0") || 50;
                    const estimatedCost = guests * 20;
                    return sum + estimatedCost;
                }
            } catch {
                // Skip if can't calculate
            }
            return sum;
        }, 0);

        return NextResponse.json({
            period: {
                from: dateFrom || "All time",
                to: dateTo || "Present",
            },
            totalRequests: requests.length,
            statusBreakdown,
            conversionRate: conversionRate.toFixed(1) + "%",
            averageResponseTimeHours: avgResponseTime,
            estimatedValue: `$${estimatedValue.toLocaleString()}`,
            trends: {
                mostCommonStatus: Object.entries(statusBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0],
                activeConversations: requests.filter((r) => r.chatEnabled).length,
                archivedRequests: (await prisma.cateringRequest.count({ where: { ...where, isArchived: true } })),
            },
        });
    } catch (error) {
        console.error("Error fetching catering analytics:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
