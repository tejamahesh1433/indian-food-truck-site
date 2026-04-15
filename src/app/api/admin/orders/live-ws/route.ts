/**
 * WebSocket endpoint for real-time order updates
 * Kitchen Display System (KDS) live feed
 *
 * Usage:
 *   const ws = new WebSocket('ws://yoursite.com/api/admin/orders/live-ws')
 *   ws.onmessage = (e) => {
 *     const order = JSON.parse(e.data);
 *     console.log('Order update:', order);
 *   }
 */

import { NextRequest } from 'next/server';
import { getAdminCookieName, verifyAdminToken } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

// Store active WebSocket connections
const activeConnections = new Set<WebSocket>();

// Types
interface OrderUpdate {
  type: 'initial' | 'update' | 'new' | 'status-change';
  order: any;
  timestamp: string;
}

/**
 * Get all active orders for initial load
 */
async function getActiveOrders() {
  return prisma.order.findMany({
    where: {
      status: {
        in: ['PENDING', 'PAID', 'PREPARING', 'READY'],
      },
    },
    orderBy: { createdAt: 'asc' },
    include: { items: true },
  });
}

/**
 * Authenticate the WebSocket connection
 */
async function authenticateConnection(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(getAdminCookieName())?.value;

  if (!token) {
    console.warn('[WebSocket] Connection rejected: Missing admin token');
    return false;
  }

  const isValid = await verifyAdminToken(token).catch(() => false);

  if (!isValid) {
    console.warn('[WebSocket] Connection rejected: Invalid admin token');
    return false;
  }

  return true;
}

/**
 * Handle WebSocket upgrade request
 */
export async function GET(req: NextRequest) {
  // Only handle WebSocket upgrade in Edge Runtime or with proper headers
  const upgrade = req.headers.get('upgrade');

  if (upgrade !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 400 });
  }

  try {
    // Authenticate before accepting connection
    const isAuthenticated = await authenticateConnection(req);
    if (!isAuthenticated) {
      return new Response('Unauthorized', { status: 401 });
    }

    // For Vercel/Edge Runtime - WebSocket support requires special handling
    // This is a placeholder that demonstrates the WebSocket concept
    // In production, you'd use a WebSocket library or runtime that supports it

    return new Response('WebSocket support requires runtime adapter', {
      status: 501,
      statusText: 'Not Implemented',
    });
  } catch (error) {
    console.error('[WebSocket] Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * Alternative: Server-Sent Events (SSE) - More reliable for most deployments
 * This is more compatible with serverless environments
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = req.cookies.get(getAdminCookieName())?.value;

    if (!token || !(await verifyAdminToken(token).catch(() => false))) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get initial orders for client
    const orders = await getActiveOrders();

    // Return SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial data
        const initialMessage = {
          type: 'initial',
          orders,
          timestamp: new Date().toISOString(),
        };

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(initialMessage)}\n\n`)
        );

        // Keep connection alive with periodic pings
        let isConnected = true;
        const pingInterval = setInterval(() => {
          if (isConnected) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`)
            );
          }
        }, 30000); // Ping every 30 seconds

        // Listen for order updates
        // In production, you'd use Prisma's real-time features or a message queue
        // For now, this polls the database
        const pollInterval = setInterval(async () => {
          try {
            if (!isConnected) return;

            const updatedOrders = await getActiveOrders();
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'update',
                  orders: updatedOrders,
                  timestamp: new Date().toISOString(),
                })}\n\n`
              )
            );
          } catch (error) {
            console.error('[SSE] Error polling orders:', error);
          }
        }, 3000); // Poll every 3 seconds (vs previous 5 seconds)

        // Cleanup on client disconnect
        return () => {
          isConnected = false;
          clearInterval(pingInterval);
          clearInterval(pollInterval);
        };
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable proxy buffering
      },
    });
  } catch (error) {
    console.error('[SSE] Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
