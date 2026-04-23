import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Cache settings for 60 seconds

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "global" }
        });

        if (!settings) {
            return NextResponse.json({ error: "Settings not found" }, { status: 404 });
        }

        // Sanitize sensitive data before sending to the client
        // Use a type cast to ensure we can destructure the PIN even if the client type is stale
        const { adminAccessPin: _, ...publicSettings } = settings as { adminAccessPin?: string };

        return NextResponse.json(publicSettings);
    } catch (error) {
        console.error("Error fetching public settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
