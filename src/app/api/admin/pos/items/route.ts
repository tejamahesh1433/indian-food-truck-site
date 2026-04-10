import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/pos/items
 * Fetch all menu items currently marked for POS integration
 */
export async function GET() {
    try {
        const items = await prisma.menuItem.findMany({
            where: { inPos: true },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ 
            success: true, 
            items 
        });
    } catch (error) {
        console.error('[POS API] Failed to fetch items:', error);
        return NextResponse.json(
            { error: 'Failed to fetch POS items' },
            { status: 500 }
        );
    }
}
