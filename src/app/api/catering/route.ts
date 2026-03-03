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
});

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { ok: false, error: "Invalid form data" },
            { status: 400 }
        );
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
