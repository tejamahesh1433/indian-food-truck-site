/**
 * POS Webhook Handler
 * Receives events from POS system (inventory, price, order updates)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPOSManager } from '@/lib/pos/manager';
import { POSWebhookPayload } from '@/lib/pos/types';
import crypto from 'crypto';

/**
 * Verifies POS webhook signature using HMAC-SHA256.
 * Signature header value may optionally be prefixed with "sha256=".
 * Uses timing-safe comparison to prevent timing attacks.
 */
function verifyPOSSignature(payload: string, signature: string, secret: string): boolean {
    const expected = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');

    const provided = signature.startsWith('sha256=') ? signature.slice(7) : signature;

    try {
        return crypto.timingSafeEqual(
            Buffer.from(provided, 'hex'),
            Buffer.from(expected, 'hex'),
        );
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest) {
    try {
        // Read raw body first — required for signature verification
        const rawBody = await req.text();

        // Verify webhook signature when a secret is configured
        const webhookSecret = process.env.POS_WEBHOOK_SECRET;
        if (webhookSecret) {
            const signature = req.headers.get('x-pos-signature');
            if (!signature) {
                console.warn('[POS] Webhook rejected: missing x-pos-signature header');
                return NextResponse.json(
                    { error: 'Missing webhook signature' },
                    { status: 401 },
                );
            }
            if (!verifyPOSSignature(rawBody, signature, webhookSecret)) {
                console.warn('[POS] Webhook rejected: invalid signature');
                return NextResponse.json(
                    { error: 'Invalid webhook signature' },
                    { status: 401 },
                );
            }
        }

        let body: POSWebhookPayload;
        try {
            body = JSON.parse(rawBody) as POSWebhookPayload;
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON payload' },
                { status: 400 },
            );
        }

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
