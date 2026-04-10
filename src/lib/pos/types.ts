/**
 * POS Integration Types
 * Framework for connecting to any POS system (Square, Toast, TouchBistro, etc.)
 */

export interface POSItem {
    id: string;
    name: string;
    price: number; // in dollars
    category: string;
    available: boolean;
    sku?: string;
    description?: string;
    imageUrl?: string;
}

export interface POSInventory {
    itemId: string;
    quantity: number;
    lastUpdated: Date;
}

export interface POSOrder {
    id: string;
    externalId?: string; // POS system's order ID
    items: POSOrderItem[];
    total: number;
    status: 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface POSOrderItem {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    special_instructions?: string;
}

export interface POSWebhookPayload {
    event: POSWebhookEvent;
    timestamp: Date;
    data: Record<string, unknown>;
}

export type POSWebhookEvent =
    | 'item.created'
    | 'item.updated'
    | 'item.deleted'
    | 'item.out_of_stock'
    | 'item.back_in_stock'
    | 'inventory.updated'
    | 'order.created'
    | 'order.updated'
    | 'order.completed'
    | 'price.updated'
    | 'category.updated';

export interface POSConfig {
    enabled: boolean;
    provider: 'square' | 'toast' | 'touchbistro' | 'mock';
    apiKey?: string;
    apiUrl?: string;
    webhookSecret?: string;
    webhookUrl?: string;
    syncInterval?: number; // milliseconds
    autoSync?: boolean;
}

export interface POSSyncResult {
    success: boolean;
    message?: string;
    itemsSync?: number;
    itemsFailed?: number;
    error?: string;
}

export interface POSConnectionStatus {
    connected: boolean;
    lastConnected?: Date;
    lastSyncAt?: Date;
    nextSyncAt?: Date;
    error?: string;
}

/**
 * Abstract POS Adapter Interface
 * Implement this for each POS system
 */
export interface IPOSAdapter {
    // Connection
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    getStatus(): POSConnectionStatus;

    // Items
    syncItem(item: POSItem): Promise<boolean>;
    syncAllItems(items: POSItem[]): Promise<POSSyncResult>;
    getItem(id: string): Promise<POSItem | null>;
    getAllItems(): Promise<POSItem[]>;

    // Inventory
    updateInventory(itemId: string, quantity: number): Promise<boolean>;
    getInventory(itemId: string): Promise<POSInventory | null>;
    checkInventory(items: Array<{ itemId: string; quantity: number }>): Promise<boolean>;

    // Availability
    setItemAvailable(itemId: string): Promise<boolean>;
    setItemUnavailable(itemId: string): Promise<boolean>;

    // Orders
    createOrder(order: POSOrder): Promise<string | null>; // Returns POS order ID
    updateOrderStatus(posOrderId: string, status: string): Promise<boolean>;
    getOrder(posOrderId: string): Promise<POSOrder | null>;

    // Webhooks
    verifyWebhookSignature(payload: string, signature: string): boolean;
    processWebhook(payload: POSWebhookPayload): Promise<void>;

    // Health Check
    healthCheck(): Promise<boolean>;
}
