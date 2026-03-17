import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { pin } = await req.json();

        // Check database first, then fall back to env var
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "global" },
            select: { adminAccessPin: true },
        });

        const correctPin = settings?.adminAccessPin || process.env.ADMIN_ACCESS_PIN;

        if (!correctPin) {
            // If no PIN is configured anywhere, skip the gate
            return NextResponse.json({ success: true });
        }

        if (!pin || pin !== correctPin) {
            return NextResponse.json(
                { error: "Invalid access code" },
                { status: 401 }
            );
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
