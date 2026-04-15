/**
 * React Hook for real-time order updates via Server-Sent Events (SSE)
 *
 * Usage:
 *   const { orders, isConnected, error } = useLiveOrders();
 *
 * Features:
 *   - Automatic reconnection on disconnect
 *   - Exponential backoff for retries
 *   - Proper cleanup on component unmount
 *   - Type-safe order updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface OrderWithItems {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface LiveOrdersState {
  orders: OrderWithItems[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

const INITIAL_BACKOFF_MS = 1000; // 1 second
const MAX_BACKOFF_MS = 30000; // 30 seconds

export function useLiveOrders() {
  const [state, setState] = useState<LiveOrdersState>({
    orders: [],
    isConnected: false,
    isConnecting: false,
    error: null,
    lastUpdate: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Connect to SSE stream
   */
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      console.warn('[LiveOrders] Already connected or connecting');
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true }));

    try {
      // Construct the correct URL based on current location
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const host = window.location.host;
      const url = `${protocol}//${host}/api/admin/orders/live-ws`;

      console.log('[LiveOrders] Connecting to', url);

      const eventSource = new EventSource(url, { withCredentials: true });

      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'ping') {
            // Heartbeat - keep connection alive
            console.debug('[LiveOrders] Ping received');
            return;
          }

          if (data.type === 'initial') {
            // Initial load
            console.log('[LiveOrders] Initial load:', data.orders?.length, 'orders');
            setState((prev) => ({
              ...prev,
              orders: data.orders || [],
              isConnected: true,
              isConnecting: false,
              error: null,
              lastUpdate: new Date(),
            }));
            backoffRef.current = INITIAL_BACKOFF_MS;
          } else if (data.type === 'update') {
            // Incremental update
            console.log('[LiveOrders] Update:', data.orders?.length, 'orders');
            setState((prev) => ({
              ...prev,
              orders: data.orders || [],
              lastUpdate: new Date(),
            }));
          }
        } catch (err) {
          console.error('[LiveOrders] Failed to parse message:', err, event.data);
        }
      });

      eventSource.addEventListener('error', (event) => {
        console.warn('[LiveOrders] EventSource error:', event);

        eventSource.close();
        eventSourceRef.current = null;

        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: 'Connection lost. Reconnecting...',
        }));

        // Exponential backoff retry
        const retryAfter = backoffRef.current;
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);

        console.log('[LiveOrders] Retrying in', retryAfter, 'ms');

        retryTimeoutRef.current = setTimeout(() => {
          connect();
        }, retryAfter);
      });

      eventSource.addEventListener('open', () => {
        console.log('[LiveOrders] Connected');
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
        backoffRef.current = INITIAL_BACKOFF_MS;
      });

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('[LiveOrders] Connection failed:', error);
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    }
  }, []);

  /**
   * Disconnect from SSE stream
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('[LiveOrders] Disconnecting');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  }, []);

  /**
   * Manual reconnect
   */
  const reconnect = useCallback(() => {
    disconnect();
    backoffRef.current = INITIAL_BACKOFF_MS;
    connect();
  }, [connect, disconnect]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    orders: state.orders,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    lastUpdate: state.lastUpdate,
    reconnect,
  };
}
