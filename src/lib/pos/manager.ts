/**
 * POS Manager
 * Handles connection, syncing, and webhooks
 * Can work with any POS adapter (Square, Toast, Mock, etc.)
 */

import { IPOSAdapter, POSItem, POSConfig, POSWebhookPayload } from './types';
import { MockPOSAdapter } from './adapters/mock.adapter';
import { prisma } from '@/lib/prisma';

export class POSManager {
    private adapter: IPOSAdapter;
    private config: POSConfig;
    private syncInterval?: NodeJS.Timeout;
    private initialized = false;
    private initializing: Promise<boolean> | null = null;

    constructor(config: POSConfig) {
        this.config = config;

        // Select adapter based on config
        if (config.provider === 'mock') {
            this.adapter = new MockPOSAdapter();
        } else {
            // TODO: Add real adapters here
            // case 'square': return new SquarePOSAdapter();
            // case 'toast': return new ToastPOSAdapter();
            throw new Error(`POS provider not implemented: ${config.provider}`);
        }
    }

    /**
     * Initialize POS connection
     */
    async initialize(): Promise<boolean> {
        if (this.initialized) return true;
        if (this.initializing) return this.initializing;

        this.initializing = (async () => {
            if (!this.config.enabled) {
                console.log('[POS] POS integration disabled in config');
                this.initialized = false;
                return false;
            }

            try {
                const connected = await this.adapter.connect();

                if (connected && this.config.autoSync) {
                    this.startAutoSync();
                }

                this.initialized = connected;
                return connected;
            } catch (error) {
                console.error('[POS] Failed to initialize:', error);
                this.initialized = false;
                return false;
            } finally {
                this.initializing = null;
            }
        })();

        return this.initializing;
    }

    /**
     * Sync all menu items from database to POS
     */
    async syncMenuItems(): Promise<void> {
        await this.initialize();
        console.log('[POS] Starting menu sync...');

        try {
            const menuItems = await prisma.menuItem.findMany({
                where: { inPos: true, isAvailable: true },
            });

            const posItems: POSItem[] = menuItems.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.priceCents / 100, // Convert cents to dollars
                category: item.category || 'General',
                available: item.isAvailable,
                sku: `SKU-${item.id}`,
                description: item.description || undefined,
            }));

            const result = await this.adapter.syncAllItems(posItems);

            if (result.success) {
                console.log(
                    `[POS] ✓ Menu sync complete: ${result.itemsSync} items synced`
                );
                await this.recordSyncLog();
            } else {
                console.error(
                    `[POS] ✗ Menu sync failed: ${result.itemsFailed} items`
                );
                await this.recordSyncLog();
            }
        } catch (error) {
            console.error('[POS] Menu sync error:', error);
            await this.recordSyncLog();
        }
    }

    /**
     * Sync a single menu item to POS
     */
    async syncMenuItem(itemId: string): Promise<boolean> {
        await this.initialize();
        try {
            const item = await prisma.menuItem.findUnique({
                where: { id: itemId, inPos: true },
            });

            if (!item) {
                console.error(`[POS] Item not found or not marked for POS: ${itemId}`);
                return false;
            }

            const posItem: POSItem = {
                id: item.id,
                name: item.name,
                price: item.priceCents / 100,
                category: item.category || 'General',
                available: item.isAvailable,
                sku: `SKU-${item.id}`,
                description: item.description || undefined,
            };

            const success = await this.adapter.syncItem(posItem);
            
            if (success) {
                console.log(`[POS] ✓ Item synced: ${item.name}`);
                await this.recordSyncLog();
            } else {
                console.error(`[POS] ✗ Failed to sync item: ${item.name}`);
            }

            return success;
        } catch (error) {
            console.error('[POS] Single item sync error:', error);
            return false;
        }
    }

    /**
     * Sync order to POS
     */
    async syncOrder(orderId: string): Promise<string | null> {
        await this.initialize();
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });

            if (!order) {
                console.error(`[POS] Order not found: ${orderId}`);
                return null;
            }

            const posOrder = {
                id: orderId,
                items: order.items.map((item) => ({
                    menuItemId: item.menuItemId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.priceCents / 100,
                })),
                total: order.totalAmount / 100,
                status: order.status,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            };

            const posOrderId = await this.adapter.createOrder(posOrder);

            if (posOrderId) {
                // Store POS order ID for future reference
                await prisma.order.update({
                    where: { id: orderId },
                    data: { posOrderId },
                });

                console.log(
                    `[POS] ✓ Order synced: ${orderId} → ${posOrderId}`
                );
                return posOrderId;
            }

            return null;
        } catch (error) {
            console.error('[POS] Order sync error:', error);
            return null;
        }
    }

    /**
     * Update order status in POS when status changes in website
     */
    async updateOrderStatus(
        orderId: string,
        status: string
    ): Promise<boolean> {
        await this.initialize();
        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
            });

            if (!order || !order.posOrderId) {
                console.log(`[POS] No POS order ID for: ${orderId}`);
                return false;
            }

            const updated = await this.adapter.updateOrderStatus(
                order.posOrderId,
                status
            );

            if (updated) {
                console.log(
                    `[POS] ✓ Order status updated: ${orderId} → ${status}`
                );
            }

            return updated;
        } catch (error) {
            console.error('[POS] Order status update error:', error);
            return false;
        }
    }

    /**
     * Handle webhook from POS (inventory, price, order updates)
     */
    async handleWebhook(payload: POSWebhookPayload): Promise<void> {
        await this.initialize();
        console.log(`[POS] Webhook received: ${payload.event}`);

        try {
            // Process with adapter
            await this.adapter.processWebhook(payload);

            // Handle specific events
            switch (payload.event) {
                case 'inventory.updated':
                    await this.handleInventoryUpdate(payload);
                    break;
                case 'item.updated':
                    await this.handleItemUpdate(payload);
                    break;
                case 'item.out_of_stock':
                    await this.handleOutOfStock(payload);
                    break;
                case 'price.updated':
                    await this.handlePriceUpdate(payload);
                    break;
            }

            console.log(`[POS] ✓ Webhook processed: ${payload.event}`);
        } catch (error) {
            console.error('[POS] Webhook processing error:', error);
            throw error;
        }
    }

    /**
     * Event handlers for webhook updates
     */

    private async handleInventoryUpdate(payload: POSWebhookPayload): Promise<void> {
        const { itemId, quantity } = payload.data as { itemId: string; quantity: number };

        await prisma.menuItem.update({
            where: { id: itemId },
            data: { isAvailable: quantity > 0 },
        });

        console.log(`[POS] Inventory updated: ${itemId} → ${quantity}`);
    }

    private async handleItemUpdate(payload: POSWebhookPayload): Promise<void> {
        const { itemId, name, price, category } = payload.data as { itemId: string; name?: string; price?: number; category?: string };

        await prisma.menuItem.update({
            where: { id: itemId },
            data: {
                name: name || undefined,
                priceCents: typeof price === 'number' ? Math.round(price * 100) : undefined,
                category: category || undefined,
            },
        });

        console.log(`[POS] Item updated: ${itemId}`);
    }

    private async handleOutOfStock(payload: POSWebhookPayload): Promise<void> {
        const { itemId } = payload.data as { itemId: string };

        await prisma.menuItem.update({
            where: { id: itemId },
            data: { isAvailable: false },
        });

        console.log(`[POS] Item out of stock: ${itemId}`);
    }

    private async handlePriceUpdate(payload: POSWebhookPayload): Promise<void> {
        const { itemId, price } = payload.data as { itemId: string; price: number };

        await prisma.menuItem.update({
            where: { id: itemId },
            data: { priceCents: typeof price === 'number' ? Math.round(price * 100) : 0 },
        });

        console.log(`[POS] Price updated: ${itemId} → $${price}`);
    }

    /**
     * Auto-sync at regular intervals
     */
    private startAutoSync(): void {
        if (this.syncInterval) return;

        const interval = this.config.syncInterval || 30000; // 30 seconds default

        console.log(`[POS] Starting auto-sync every ${interval}ms`);

        this.syncInterval = setInterval(async () => {
            try {
                await this.syncMenuItems();
            } catch (error) {
                console.error('[POS] Auto-sync error:', error);
            }
        }, interval);
    }

    /**
     * Stop auto-sync
     */
    stopAutoSync(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = undefined;
            console.log('[POS] Auto-sync stopped');
        }
    }

    /**
     * Get connection status
     */
    getStatus() {
        return this.adapter.getStatus();
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<boolean> {
        await this.initialize();
        return this.adapter.healthCheck();
    }

    /**
     * Record sync logs for debugging
     */
    private async recordSyncLog(): Promise<void> {
        try {
            // TODO: Create POSSyncLog table in schema if you want to track history
            // });
        } catch (err) {
            console.error('[POS] Failed to record sync log:', err);
        }
    }

    /**
     * Cleanup on shutdown
     */
    async disconnect(): Promise<void> {
        this.stopAutoSync();
        await this.adapter.disconnect();
        this.initialized = false;
        console.log('[POS] Disconnected');
    }
}

/**
 * Global POS Manager instance (Next.js singleton pattern)
 */
const globalForPOS = globalThis as unknown as {
    posManager: POSManager | undefined;
};

export function getPOSManager(): POSManager {
    if (!globalForPOS.posManager) {
        const config: POSConfig = {
            enabled: process.env.POS_ENABLED === 'true',
            provider: (process.env.POS_PROVIDER as POSConfig['provider']) || 'mock',
            apiKey: process.env.POS_API_KEY,
            apiUrl: process.env.POS_API_URL,
            webhookSecret: process.env.POS_WEBHOOK_SECRET,
            webhookUrl: process.env.POS_WEBHOOK_URL,
            syncInterval: parseInt(process.env.POS_SYNC_INTERVAL || '30000'),
            autoSync: process.env.POS_AUTO_SYNC === 'true',
        };

        globalForPOS.posManager = new POSManager(config);
    }

    return globalForPOS.posManager;
}

/**
 * Initialize POS on app startup
 */
export async function initializePOS(): Promise<void> {
    const manager = getPOSManager();
    await manager.initialize();
}
