import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * CRON JOB: Cleanup old chat messages
 * Retention Period: 48 Hours
 * 
 * Secure this route in production by checking for a CRON_SECRET header or similar.
 */
export async function GET(req: Request) {
    // Basic security check (optional - can be enhanced with an env secret)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        // Delete old messages from all chat categories
        const results = await Promise.all([
            // Status-aware cleanup for Orders:
            // Only delete messages if the order is COMPLETED/CANCELLED AND it's been 48h since that status change.
            prisma.orderMessage.deleteMany({
                where: {
                    order: {
                        status: { in: ["COMPLETED", "CANCELLED"] },
                        updatedAt: { lt: fortyEightHoursAgo }
                    }
                }
            }),
            prisma.cateringMessage.deleteMany({
                where: { createdAt: { lt: fortyEightHoursAgo } }
            }),
            prisma.supportMessage.deleteMany({
                where: { createdAt: { lt: fortyEightHoursAgo } }
            })
        ]);

        return NextResponse.json({
            success: true,
            deleted: {
                orderMessages: results[0].count,
                cateringMessages: results[1].count,
                supportMessages: results[2].count
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("CRON_CLEANUP_ERROR:", error);
        return NextResponse.json({ 
            error: "Cleanup failed", 
            details: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}
