import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Schema = z.object({
    name: z.string().min(1),
    phone: z.string().min(5),
    email: z.string().email(),
    eventDate: z.string().optional(),
    guests: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    website: z.string().optional(),
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
    if (!applyRateLimit(ip)) {
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

    const created = await prisma.cateringRequest.create({
        data: {
            name: parsed.data.name,
            phone: parsed.data.phone,
            email: parsed.data.email,
            eventDate: parsed.data.eventDate || null,
            guests: parsed.data.guests || null,
            location: parsed.data.location || null,
            notes: parsed.data.notes || null,
        },
    });

    return NextResponse.json({ ok: true, id: created.id });
}
