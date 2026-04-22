"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/dist/MotionPathPlugin";
import "./cartAnimation.css";

if (typeof window !== "undefined") {
    gsap.registerPlugin(MotionPathPlugin);
}

interface FlyItem {
    id: string;
    imageUrl: string;
    startX: number;
    startY: number;
}

interface CartAnimationContextType {
    flyToCart: (imageUrl: string, sourceEl: HTMLElement) => void;
}

const CartAnimationContext = createContext<CartAnimationContextType>({
    flyToCart: () => {},
});

const SIZE = 64;

export function CartAnimationProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<FlyItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const flyToCart = useCallback((imageUrl: string, sourceEl: HTMLElement) => {
        const rect = sourceEl.getBoundingClientRect();
        setItems((prev) => [
            ...prev,
            {
                id: `fly-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                imageUrl,
                startX: rect.left + rect.width / 2,
                startY: rect.top + rect.height / 2,
            },
        ]);
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    return (
        <CartAnimationContext.Provider value={{ flyToCart }}>
            {children}
            {mounted && items.map((item) =>
                createPortal(
                    <FlyingItem key={item.id} item={item} onDone={() => removeItem(item.id)} />,
                    document.body
                )
            )}
        </CartAnimationContext.Provider>
    );
}

export function useCartAnimation() {
    return useContext(CartAnimationContext);
}

function FlyingItem({ item, onDone }: { item: FlyItem; onDone: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        const wrap = wrapRef.current;
        if (!el || !wrap) return;

        const target = document.getElementById("cart-fly-target");
        if (!target) { onDone(); return; }

        const targetRect = target.getBoundingClientRect();
        const endX = targetRect.left + targetRect.width / 2 - SIZE / 2;
        const endY = targetRect.top + targetRect.height / 2 - SIZE / 2;

        // Start position: centered on source button
        gsap.set(el, { 
            x: item.startX - SIZE / 2, 
            y: item.startY - SIZE / 2, 
            scale: 0, 
            opacity: 1,
            rotation: 0 
        });

        // Hide wrap overlay initially
        gsap.set(wrap, { opacity: 0, scale: 1.2 });

        const tl = gsap.timeline({
            onComplete: () => {
                // Haptic-style punch on target
                gsap.timeline()
                    .to(target, { scale: 1.25, y: 5, duration: 0.1, ease: "power2.out" })
                    .to(target, { scale: 1, y: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
                onDone();
            },
        });

        // 1. POP IN & WRAP
        tl.to(el, { 
            scale: 1, 
            duration: 0.25, 
            ease: "back.out(2)" 
        });
        
        // Wrapping effect: Brown paper overlay fades in and "shrinks" onto the item
        tl.to(wrap, { 
            opacity: 1, 
            scale: 1, 
            duration: 0.2, 
            ease: "power2.in" 
        }, "-=0.1");

        // 2. THE THROW (Arc + Rotation)
        // Move UP first (the "throw" arc)
        const midY = Math.min(item.startY, endY) - 150;
        const midX = (item.startX + endX) / 2;

        tl.to(el, {
            motionPath: {
                path: [
                    { x: item.startX - SIZE / 2, y: item.startY - SIZE / 2 },
                    { x: midX - SIZE / 2, y: midY - SIZE / 2 },
                    { x: endX, y: endY }
                ],
                curviness: 1.5,
                autoRotate: false
            },
            rotation: 720, // Spin twice
            duration: 0.65,
            ease: "power1.inOut"
        }, "+=0.05");

        // 3. SHRINK INTO CART
        tl.to(el, { 
            scale: 0.2, 
            opacity: 0, 
            duration: 0.3 
        }, "-=0.3");

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={ref}
            className="flying-item-container shadow-2xl"
        >
            {/* The actual item image */}
            {item.imageUrl ? (
                <img
                    src={item.imageUrl}
                    alt=""
                    className="flying-item-image"
                />
            ) : (
                <div className="flying-item-fallback">
                    🍛
                </div>
            )}

            {/* The "Wrapper" Overlay (Brown Paper Effect) */}
            <div 
                ref={wrapRef}
                className="flying-item-wrapper"
            >
                {/* A little "tape" or "brand" mark on the parcel */}
                <div className="flying-item-brand">
                    C2C
                </div>
            </div>
        </div>
    );
}
