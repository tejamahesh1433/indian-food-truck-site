"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker on first render.
 * Must be a Client Component because service workers are browser-only.
 * Rendered once in the root layout.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Log the registration state for debugging
        if (registration.installing) {
          console.log("[PWA] Service worker installing…");
        } else if (registration.waiting) {
          console.log("[PWA] Service worker installed, waiting to activate.");
        } else if (registration.active) {
          console.log("[PWA] Service worker active.");
        }

        // When a new SW is waiting, reload to activate it immediately
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // A new service worker is ready — activate it on next navigation
              console.log("[PWA] New service worker ready. Reload to update.");
            }
          });
        });
      } catch (err) {
        console.error("[PWA] Service worker registration failed:", err);
      }
    };

    // Register after the page has fully loaded to avoid slowing down first paint
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
