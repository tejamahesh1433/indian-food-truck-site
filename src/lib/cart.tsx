"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";

export type CartAddon = {
    id: string;
    name: string;
    priceCents: number;
};

export type AppliedPromo = {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
};

export type CartItem = {
    id: string;
    menuItemId: string;
    name: string;
    priceCents: number;
    quantity: number;
    notes?: string;
    imageUrl?: string;
    addons?: CartAddon[];
};

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity" | "id">) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    updateNotes: (id: string, notes: string) => void;
    clearCart: () => void;
    setCartItems: (items: CartItem[]) => void;
    applyPromo: (promo: AppliedPromo) => void;
    removePromo: () => void;
    appliedPromo: AppliedPromo | null;
    totalCents: number;
    subtotalCents: number;
    discountCents: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const generateCartId = (menuItemId: string, addons?: CartAddon[]) => {
    if (!addons || addons.length === 0) return menuItemId;
    const sortedAddons = [...addons].sort((a, b) => a.id.localeCompare(b.id));
    return `${menuItemId}-${sortedAddons.map(a => a.id).join('-')}`;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [items, setItems] = useState<CartItem[]>([]);
    const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
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
                const data = JSON.parse(savedCart);
                if (Array.isArray(data)) {
                    setItems(data);
                } else if (data.items) {
                    setItems(data.items);
                    setAppliedPromo(data.appliedPromo || null);
                }
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
            localStorage.setItem(cartKey, JSON.stringify({ items, appliedPromo }));
        }
    }, [items, appliedPromo, isLoaded, cartKey]);

    const subtotalCents = useMemo(() =>
        items.reduce((acc, item) => {
            const addOnsCost = item.addons?.reduce((sum, a) => sum + a.priceCents, 0) || 0;
            return acc + (item.priceCents + addOnsCost) * item.quantity;
        }, 0),
        [items]);

    // Auto-validate promo code whenever items or subtotal changes
    useEffect(() => {
        if (!isLoaded) return;

        // If cart is empty, always clear promo
        if (items.length === 0 && appliedPromo) {
            setAppliedPromo(null);
            return;
        }

        // If subtotal falls below minimum order amount, clear promo
        if (appliedPromo?.minOrderAmount && subtotalCents < appliedPromo.minOrderAmount) {
            setAppliedPromo(null);
            // Optional: could trigger a notification here if we had a toast system in the hook
        }
    }, [items.length, subtotalCents, appliedPromo, isLoaded]);

    const addToCart = useCallback((item: Omit<CartItem, "quantity" | "id">) => {
        const cartId = generateCartId(item.menuItemId, item.addons);
        setItems((prev) => {
            const existing = prev.find((i) => i.id === cartId);
            if (existing) {
                return prev.map((i) =>
                    i.id === cartId ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, id: cartId, quantity: 1 }];
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

    const updateNotes = useCallback((id: string, notes: string) => {
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, notes } : i))
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        setAppliedPromo(null);
    }, []);

    const setCartItems = useCallback((newItems: CartItem[]) => {
        setItems(newItems);
    }, []);

    const applyPromo = useCallback((promo: AppliedPromo) => {
        setAppliedPromo(promo);
    }, []);

    const removePromo = useCallback(() => {
        setAppliedPromo(null);
    }, []);

    const discountCents = useMemo(() => {
        if (!appliedPromo) return 0;
        let discount = 0;
        if (appliedPromo.discountType === "PERCENTAGE") {
            discount = Math.round(subtotalCents * (appliedPromo.discountValue / 100));
        } else {
            discount = appliedPromo.discountValue;
        }

        // Apply max discount cap if it exists
        if (appliedPromo.maxDiscountAmount && discount > appliedPromo.maxDiscountAmount) {
            return appliedPromo.maxDiscountAmount;
        }

        return discount;
    }, [appliedPromo, subtotalCents]);

    const totalCents = useMemo(() => Math.max(0, subtotalCents - discountCents), [subtotalCents, discountCents]);

    const contextValue = useMemo(() => ({
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
        setCartItems,
        applyPromo,
        removePromo,
        appliedPromo,
        totalCents,
        subtotalCents,
        discountCents,
    }), [items, addToCart, removeFromCart, updateQuantity, updateNotes, clearCart, setCartItems, applyPromo, removePromo, appliedPromo, totalCents, subtotalCents, discountCents]);

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
