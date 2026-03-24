import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const specials = await prisma.todaysSpecial.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });

        return NextResponse.json(specials);
    } catch (error) {
        console.error("Public GET TodaysSpecial Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
