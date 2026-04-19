import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find the user first to get the ID
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        /**
         * Delete user account
         * Note: Cascade deletion in schema handles related records (orders, favorites, etc.)
         * based on the references in schema.prisma.
         */
        await prisma.user.delete({
            where: { id: user.id }
        });

        // The session will effectively be invalid as the user record is gone,
        // but the client should still call signOut() to clear the cookie.
        return NextResponse.json({ message: "Account deleted successfully" });
    } catch (error: any) {
        console.error("DELETE_ACCOUNT_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
