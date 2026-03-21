import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name } = Schema.parse(body);

        await prisma.newsletterSubscriber.upsert({
            where: { email },
            update: { name: name || undefined },
            create: { email, name: name || null },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
        }
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}

export async function GET() {
    // Admin only: return subscriber count + list (protected by admin layout)
    try {
        const subscribers = await prisma.newsletterSubscriber.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ subscribers, count: subscribers.length });
    } catch {
        return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
    }
}
