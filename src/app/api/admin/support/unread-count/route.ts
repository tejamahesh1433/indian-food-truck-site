import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Get all catering requests with unread messages
        // For each request, count messages sent by CUSTOMER after last admin message
        const requests = await prisma.cateringRequest.findMany({
            where: { isArchived: false },
            include: {
                messages: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        const unreadData = requests.map((request) => {
            // Find last admin message
            const lastAdminMessage = request.messages.find((m) => m.sender === "ADMIN");
            const lastAdminTime = lastAdminMessage?.createdAt || new Date(0);

            // Count customer messages after last admin message
            const unreadCount = request.messages.filter(
                (m) => m.sender === "CUSTOMER" && m.createdAt > lastAdminTime
            ).length;

            return {
                requestId: request.id,
                customerName: request.name,
                unreadCount,
                hasUnread: unreadCount > 0,
            };
        });

        const totalUnread = unreadData.reduce((sum, r) => sum + r.unreadCount, 0);

        return NextResponse.json({
            totalUnread,
            conversations: unreadData.filter((r) => r.hasUnread),
            allConversations: unreadData,
        });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return NextResponse.json(
            { error: "Failed to fetch unread count" },
            { status: 500 }
        );
    }
}
