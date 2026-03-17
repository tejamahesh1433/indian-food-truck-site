import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { makeChatToken } from "@/lib/tokens";
import { sendChatLinkEmail } from "@/lib/mail";

const Schema = z.object({
    name: z.string().min(1),
    phone: z.string().min(5),
    email: z.string().email(),
    eventDate: z.string().optional(),
    guests: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    website: z.string().optional(),
    selections: z.array(z.any()).optional(),
});

// Simple in-memory rate limit Map. Keys: IP -> { count, expires }
const rateLimitMap = new Map<string, { count: number; expires: number }>();

function applyRateLimit(ip: string): boolean {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 3;

    let record = rateLimitMap.get(ip);
    if (!record || record.expires < now) {
        record = { count: 1, expires: now + windowMs };
        rateLimitMap.set(ip, record);
        return true; // Allowed
    }

    if (record.count >= maxAttempts) {
        return false; // Throttled
    }

    record.count++;
    return true; // Allowed
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { ok: false, error: "Invalid form data" },
            { status: 400 }
        );
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const isDev = process.env.NODE_ENV !== "production";

    // 1. Availability Check
    const settings = await prisma.siteSettings.findUnique({
        where: { id: "global" },
        select: { cateringEnabled: true }
    });
    if (settings && settings.cateringEnabled === false) {
        return NextResponse.json(
            { ok: false, error: "Catering submissions are currently paused. Please try again later." },
            { status: 503 }
        );
    }

    if (!isDev && !applyRateLimit(ip)) {
        return NextResponse.json(
            { ok: false, error: "Too many requests. Please wait before submitting again." },
            { status: 429 }
        );
    }

    // Honeypot Trap
    if (parsed.data.website) {
        // Silently succeed to trick the bot
        return NextResponse.json({ ok: true });
    }

    try {
        console.log("CATERING_SUBMIT: Starting DB create...");
        const created = await prisma.cateringRequest.create({
            data: {
                name: parsed.data.name,
                phone: parsed.data.phone,
                email: parsed.data.email,
                eventDate: parsed.data.eventDate || null,
                guests: parsed.data.guests || null,
                location: parsed.data.location || "TBD",
                notes: parsed.data.notes || null,
                selections: parsed.data.selections || undefined,
                chatToken: makeChatToken(),
            },
        });
        console.log("CATERING_SUBMIT: DB create success. ID:", created.id);

        // Send email notification asynchronously (don't block the response)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || "http://localhost:3000";
        const chatLink = `${baseUrl}/catering/chat/${created.chatToken}`;

        console.log("CATERING_SUBMIT: Triggering email to", created.email, "with link:", chatLink);

        sendChatLinkEmail({
            email: created.email,
            name: created.name,
            chatLink: chatLink,
            eventDate: created.eventDate || undefined,
            guests: created.guests || undefined,
            location: created.location || "TBD",
            selections: (created.selections as any[]) || [],
        }).then(() => {
            console.log("CATERING_SUBMIT: sendChatLinkEmail finished.");
        }).catch(e => {
            console.error("CATERING_SUBMIT: EMAIL_SEND_BG_ERROR:", e);
        });

        return NextResponse.json({ ok: true, chatToken: created.chatToken });
    } catch (err: any) {
        console.error("CATERING_SUBMIT_ERROR:", err);
        return NextResponse.json(
            { ok: false, error: err.message || "Database error" },
            { status: 500 }
        );
    }
}
