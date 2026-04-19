"use client";

import { useEffect } from "react";

export default function AutoPrint() {
    useEffect(() => {
        // Wait for fonts and images to potentially load
        const timer = setTimeout(() => {
            window.print();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return null;
}
