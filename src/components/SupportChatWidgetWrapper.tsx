"use client";

import { usePathname } from "next/navigation";
import SupportChatWidget from "./SupportChatWidget";

export default function SupportChatWidgetWrapper() {
    const pathname = usePathname();

    // Only show on home page
    if (pathname !== "/") {
        return null;
    }

    return <SupportChatWidget />;
}
