import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, address } = await req.json();

        if (!name || !address) {
            return NextResponse.json({ error: "Name and address are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const newLocation = await prisma.savedLocation.create({
            data: {
                userId: user.id,
                name,
                address
            }
        });

        return NextResponse.json(newLocation);
    } catch (error: unknown) {
        console.error("ADD_LOCATION_ERROR:", error);
        if (error instanceof Error && (error as NodeJS.ErrnoException & { code?: string }).code === 'P2002') {
            return NextResponse.json({ error: "You already have a location with this name" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
