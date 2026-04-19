import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const MessageSchema = z.object({
    chatId: z.string(),
    text: z.string().min(1),
    sender: z.enum(["CUSTOMER", "ADMIN"]).default("CUSTOMER"),
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get("chatId");

        if (!chatId) {
            return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
        }

        // Check if the chat still exists — returns 404 if admin ended it
        const chatExists = await prisma.supportChat.findUnique({ where: { id: chatId }, select: { id: true } });
        if (!chatExists) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const messages = await prisma.supportMessage.findMany({
            where: { 
                chatId,
                createdAt: { gte: fortyEightHoursAgo }
            },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("DEBUG [SUPPORT MESSAGES GET]:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { chatId, text, sender } = MessageSchema.parse(body);

        const message = await prisma.supportMessage.create({
            data: {
                chatId,
                text,
                sender,
            },
        });

        // Update the chat's updatedAt timestamp
        await prisma.supportChat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({ message });
    } catch (error) {
        console.error("DEBUG [SUPPORT MESSAGES POST]:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
