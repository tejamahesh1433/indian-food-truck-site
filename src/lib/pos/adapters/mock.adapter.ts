/**
 * Mock POS Adapter
 * Used for testing and development before connecting to real POS
 */

import {
    IPOSAdapter,
    POSItem,
    POSOrder,
    POSOrderItem,
    POSWebhookPayload,
    POSConnectionStatus,
    POSSyncResult,
    POSInventory,
} from '../types';

export class MockPOSAdapter implements IPOSAdapter {
    private connected = false;
    private lastConnected?: Date;
    private lastSyncAt?: Date;
    private items: Map<string, POSItem> = new Map();
    private inventory: Map<string, POSInventory> = new Map();
    private orders: Map<string, POSOrder> = new Map();

    async connect(): Promise<boolean> {
        console.log('[POS] Connecting to Mock POS system...');
        this.connected = true;
        this.lastConnected = new Date();
        console.log('[POS] ✓ Connected to Mock POS');
        return true;
    }

    async disconnect(): Promise<void> {
        console.log('[POS] Disconnecting from Mock POS...');
        this.connected = false;
    }

    isConnected(): boolean {
        return this.connected;
    }

    getStatus(): POSConnectionStatus {
        return {
            connected: this.connected,
            lastConnected: this.lastConnected,
            lastSyncAt: this.lastSyncAt,
            nextSyncAt: this.lastSyncAt
                ? new Date(this.lastSyncAt.getTime() + 30000) // 30s interval
                : undefined,
        };
    }

    async syncItem(item: POSItem): Promise<boolean> {
        if (!this.connected) {
            console.error('[POS] Not connected');
            return false;
        }
        this.items.set(item.id, item);
        this.inventory.set(item.id, {
            itemId: item.id,
            quantity: 100, // Default stock
            lastUpdated: new Date(),
        });
        console.log(`[POS] Synced item: ${item.name}`);
        return true;
    }

    async syncAllItems(items: POSItem[]): Promise<POSSyncResult> {
        if (!this.connected) {
            return { success: false, message: 'POS not connected' };
        }

        let synced = 0;
        let failed = 0;

        for (const item of items) {
            const success = await this.syncItem(item);
            if (success) synced++;
            else failed++;
        }

        this.lastSyncAt = new Date();

        console.log(`[POS] Sync complete: ${synced} synced, ${failed} failed`);
        return {
            success: failed === 0,
            itemsSync: synced,
            itemsFailed: failed,
        };
    }

    async getItem(id: string): Promise<POSItem | null> {
        return this.items.get(id) || null;
    }

    async getAllItems(): Promise<POSItem[]> {
        return Array.from(this.items.values());
    }

    async updateInventory(itemId: string, quantity: number): Promise<boolean> {
        if (!this.connected) return false;

        const inv = this.inventory.get(itemId);
        if (!inv) return false;

        inv.quantity = quantity;
        inv.lastUpdated = new Date();

        console.log(`[POS] Inventory updated: ${itemId} → ${quantity} units`);

        // Auto-update availability based on quantity
        const item = this.items.get(itemId);
        if (item) {
            item.available = quantity > 0;
        }

        return true;
    }

    async getInventory(itemId: string): Promise<POSInventory | null> {
        return this.inventory.get(itemId) || null;
    }

    async checkInventory(
        items: Array<{ itemId: string; quantity: number }>
    ): Promise<boolean> {
        for (const { itemId, quantity } of items) {
            const inv = this.inventory.get(itemId);
            if (!inv || inv.quantity < quantity) {
                return false;
            }
        }
        return true;
    }

    async setItemAvailable(itemId: string): Promise<boolean> {
        const item = this.items.get(itemId);
        if (!item) return false;
        item.available = true;
        console.log(`[POS] Item available: ${itemId}`);
        return true;
    }

    async setItemUnavailable(itemId: string): Promise<boolean> {
        const item = this.items.get(itemId);
        if (!item) return false;
        item.available = false;
        console.log(`[POS] Item unavailable: ${itemId}`);
        return true;
    }

    async createOrder(order: POSOrder): Promise<string | null> {
        if (!this.connected) return null;

        const posOrderId = `POS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const posOrder = { ...order, id: posOrderId };
        this.orders.set(posOrderId, posOrder);

        console.log(`[POS] Order created: ${posOrderId}`);
        return posOrderId;
    }

    async updateOrderStatus(
        posOrderId: string,
        status: string
    ): Promise<boolean> {
        const order = this.orders.get(posOrderId);
        if (!order) return false;

        order.status = status as any;
        order.updatedAt = new Date();

        console.log(`[POS] Order ${posOrderId} status: ${status}`);
        return true;
    }

    async getOrder(posOrderId: string): Promise<POSOrder | null> {
        return this.orders.get(posOrderId) || null;
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        // Mock: always valid in development
        console.log('[POS] Webhook signature verified (mock)');
        return true;
    }

    async processWebhook(payload: POSWebhookPayload): Promise<void> {
        console.log(`[POS] Processing webhook: ${payload.event}`);

        switch (payload.event) {
            case 'item.updated':
                console.log('[POS] Item updated:', payload.data);
                break;
            case 'inventory.updated':
                const { itemId, quantity } = payload.data as { itemId: string; quantity: number };
                await this.updateInventory(itemId, quantity);
                break;
            case 'order.created':
                console.log('[POS] Order received:', payload.data);
                break;
            case 'order.completed':
                console.log('[POS] Order completed:', payload.data);
                break;
            default:
                console.log('[POS] Unhandled webhook event:', payload.event);
        }
    }

    async healthCheck(): Promise<boolean> {
        return this.connected;
    }
}
