import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, emailNotifications, marketingEmails } = body;

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { 
                name: name || undefined,
                emailNotifications: typeof emailNotifications === "boolean" ? emailNotifications : undefined,
                marketingEmails: typeof marketingEmails === "boolean" ? marketingEmails : undefined,
            }
        });

        return NextResponse.json({ 
            name: updatedUser.name,
            emailNotifications: updatedUser.emailNotifications,
            marketingEmails: updatedUser.marketingEmails
        });
    } catch (error: unknown) {
        console.error("UPDATE_PROFILE_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
