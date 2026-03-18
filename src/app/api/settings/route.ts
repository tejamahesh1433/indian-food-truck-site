import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "global" }
        });

        if (!settings) {
            return NextResponse.json({ error: "Settings not found" }, { status: 404 });
        }

        // Sanitize sensitive data before sending to the client
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { adminAccessPin, ...publicSettings } = settings;

        return NextResponse.json(publicSettings);
    } catch (error) {
        console.error("Error fetching public settings:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
