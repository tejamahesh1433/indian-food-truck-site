import { NextResponse } from 'next/server';
import { getPOSManager } from '@/lib/pos/manager';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/pos/sync
 * Trigger manual sync of all menu items to POS
 */
export async function POST() {
    try {
        const posManager = getPOSManager();

        // Check connection
        const status = posManager.getStatus();
        if (!status.connected) {
            return NextResponse.json(
                { error: 'POS not connected', status },
                { status: 503 }
            );
        }

        // Trigger sync
        console.log('[ADMIN] Manual POS sync triggered');
        await posManager.syncMenuItems();

        const newStatus = posManager.getStatus();

        return NextResponse.json(
            {
                success: true,
                message: 'Menu items synced to POS',
                status: newStatus,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('[ADMIN] POS sync error:', error);
        return NextResponse.json(
            {
                error: 'Sync failed',
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/pos/sync
 * Get sync status
 */
export async function GET() {
    try {
        const posManager = getPOSManager();
        await posManager.initialize();
        const status = posManager.getStatus();

        // Get count of items marked for POS
        // Using a try-catch for the DB query specifically to avoid hanging
        let posItemCount = 0;
        try {
            posItemCount = await prisma.menuItem.count({
                where: { inPos: true }
            });
        } catch (dbError) {
            console.error('[ADMIN] DB error fetching POS item count:', dbError);
        }

        return NextResponse.json(
            {
                success: true,
                status,
                posItemCount
            },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Failed to get sync status' },
            { status: 500 }
        );
    }
}
