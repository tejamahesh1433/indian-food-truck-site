import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get current item
        const item = await prisma.menuItem.findUnique({
            where: { id },
        });

        if (!item) {
            return NextResponse.json(
                { error: "Item not found" },
                { status: 404 }
            );
        }

        // Toggle availability
        const updated = await prisma.menuItem.update({
            where: { id },
            data: {
                isAvailable: !item.isAvailable,
            },
        });

        return NextResponse.json({
            success: true,
            item: {
                id: updated.id,
                name: updated.name,
                isAvailable: updated.isAvailable,
                status: updated.isAvailable ? "Available" : "86'd (Out of Stock)",
            },
        });
    } catch (error) {
        console.error("Error toggling item availability:", error);
        return NextResponse.json(
            { error: "Failed to toggle availability" },
            { status: 500 }
        );
    }
}
