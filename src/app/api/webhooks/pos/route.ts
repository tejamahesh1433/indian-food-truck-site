/**
 * POS Webhook Handler
 * Receives events from POS system (inventory, price, order updates)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPOSManager } from '@/lib/pos/manager';
import { POSWebhookPayload } from '@/lib/pos/types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as POSWebhookPayload;

        if (!body.event) {
            return NextResponse.json(
                { error: 'Missing event type' },
                { status: 400 }
            );
        }

        const posManager = getPOSManager();

        // Verify POS connection
        const status = posManager.getStatus();
        if (!status.connected) {
            console.warn('[POS] Webhook received but POS not connected');
            // Still process it, POS might reconnect
        }

        // Process webhook
        await posManager.handleWebhook(body);

        return NextResponse.json(
            { success: true, message: 'Webhook processed' },
            { status: 200 }
        );
    } catch (error) {
        console.error('[POS] Webhook error:', error);
        return NextResponse.json(
            {
                error: 'Webhook processing failed',
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

/**
 * Health check endpoint
 */
export async function GET(req: NextRequest) {
    try {
        const posManager = getPOSManager();
        const status = posManager.getStatus();

        return NextResponse.json(status, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to get POS status' },
            { status: 500 }
        );
    }
}
