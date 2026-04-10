import { NextRequest, NextResponse } from 'next/server';
import { getPOSManager } from '@/lib/pos/manager';

/**
 * POST /api/admin/pos/items/[id]
 * Manually trigger sync for a single menu item
 */
export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const posManager = getPOSManager();

        // Trigger individual sync
        console.log(`[ADMIN] Manual POS sync triggered for item: ${id}`);
        const result = await posManager.syncMenuItem(id);

        if (!result) {
            return NextResponse.json(
                { error: 'Failed to sync item', message: 'Item not found or not marked for POS' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Item synced successfully',
            status: posManager.getStatus(),
        });
    } catch (error) {
        console.error('[ADMIN] Individual item sync error:', error);
        return NextResponse.json(
            { 
                error: 'Sync failed', 
                message: error instanceof Error ? error.message : String(error) 
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/pos/items/[id]
 * Get POS details for a specific item
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // In a real implementation, this might fetch the item from the POS API
        // to check for discrepancies or status.
        // For now, we'll return a placeholder or implement specific logic if needed.
        
        return NextResponse.json({
            success: true,
            itemId: id,
            posStatus: 'active', // Mock status
            lastChecked: new Date()
        });
    } catch {
        return NextResponse.json(
            { error: 'Failed to get item details' },
            { status: 500 }
        );
    }
}
