import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = (session.user as { id: string }).id;
        const favorites = await prisma.userFavorite.findMany({
            where: { userId },
            select: { menuItemId: true }
        });

        const menuItemIds = favorites.map(f => f.menuItemId);
        return NextResponse.json({ favorites: menuItemIds });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = (session.user as { id: string }).id;
        const { menuItemId, action } = await req.json();

        if (!menuItemId || (action !== "add" && action !== "remove")) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        if (action === "add") {
            await prisma.userFavorite.upsert({
                where: {
                    userId_menuItemId: { userId, menuItemId }
                },
                update: {},
                create: { userId, menuItemId }
            });
        } else {
            await prisma.userFavorite.delete({
                where: {
                    userId_menuItemId: { userId, menuItemId }
                }
            }).catch(() => {
                // Ignore delete on non-existent
            });
        }

        const favorites = await prisma.userFavorite.findMany({
            where: { userId },
            select: { menuItemId: true }
        });

        const menuItemIds = favorites.map(f => f.menuItemId);
        return NextResponse.json({ favorites: menuItemIds });
    } catch (error) {
        console.error("Error updating favorites:", error);
        return NextResponse.json({ error: "Failed to update favorites" }, { status: 500 });
    }
}
