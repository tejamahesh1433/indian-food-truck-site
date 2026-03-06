import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const locations = await prisma.savedLocation.findMany({
        orderBy: { name: "asc" }
    });
    return NextResponse.json(locations);
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));

    if (!body.name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    try {
        const location = await prisma.savedLocation.create({
            data: {
                name: body.name,
                address: body.address || null,
            }
        });
        return NextResponse.json(location);
    } catch (e: any) {
        if (e.code === 'P2002') {
            return NextResponse.json({ error: "Location already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create location" }, { status: 500 });
    }
}
