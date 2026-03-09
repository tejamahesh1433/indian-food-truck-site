"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";

export type CartItem = {
    id: string;
    name: string;
    priceCents: number;
    quantity: number;
    imageUrl?: string;
};

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalCents: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Determine the storage key based on authentication status
    const cartKey = useMemo(() => {
        if (status === "authenticated" && session?.user?.email) {
            return `food-truck-cart-${session.user.email}`;
        }
        return "food-truck-cart-guest";
    }, [session?.user?.email, status]);

    // Load cart from local storage whenever the cartKey changes (login/logout)
    useEffect(() => {
        const savedCart = localStorage.getItem(cartKey);
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
                setItems([]);
            }
        } else {
            setItems([]);
        }
        setIsLoaded(true);
    }, [cartKey]);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(cartKey, JSON.stringify(items));
        }
    }, [items, isLoaded, cartKey]);

    const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity } : i))
        );
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalCents = useMemo(() =>
        items.reduce((acc, item) => acc + item.priceCents * item.quantity, 0),
        [items]);

    const contextValue = useMemo(() => ({
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCents,
    }), [items, addToCart, removeFromCart, updateQuantity, clearCart, totalCents]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
