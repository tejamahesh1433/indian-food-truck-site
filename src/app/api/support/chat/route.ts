import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name } = CreateSchema.parse(body);

        // Resume or Create
        const chat = await prisma.supportChat.upsert({
            where: { email },
            update: { name }, // Update name if they changed it
            create: { email, name },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                    take: 50
                }
            }
        });

        return NextResponse.json({ chat });
    } catch (error) {
        console.error("DEBUG [SUPPORT CHAT POST]:", error);
        return NextResponse.json({ error: "Failed to initialize support chat" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
        }

        await prisma.supportChat.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DEBUG [SUPPORT CHAT DELETE]:", error);
        return NextResponse.json({ error: "Failed to end support chat" }, { status: 500 });
    }
}
export async function GET() {
    try {
        const chats = await prisma.supportChat.findMany({
            orderBy: { updatedAt: "desc" },
            include: {
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                sender: "CUSTOMER",
                                isRead: false
                            }
                        }
                    }
                }
            }
        });

        // Map to a cleaner structure if needed, but Prisma's _count is fine
        return NextResponse.json({ chats });
    } catch (error) {
        console.error("DEBUG [SUPPORT CHAT GET]:", error);
        return NextResponse.json({ error: "Failed to fetch support chats" }, { status: 500 });
    }
}
