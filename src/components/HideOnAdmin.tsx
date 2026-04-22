"use client";

import { usePathname } from "next/navigation";
import React from "react";

const HIDDEN_ROUTES = ["/admin", "/truckadmin", "/verify-email", "/reset-password"];

export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isHidden = HIDDEN_ROUTES.some(route => pathname.startsWith(route));
    
    // Always render null on server or before mounting to ensure hydration match
    if (!mounted || isHidden) return null;

    return <>{children}</>;
}
