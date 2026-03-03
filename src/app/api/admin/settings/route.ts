import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    let settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
    if (!settings) {
        settings = await prisma.siteSettings.create({
            data: {
                id: "global",
                phone: "+1 415-555-0198",
                instagramUrl: "https://instagram.com",
                truckToday: "Downtown Square",
                truckNext: "University Campus"
            }
        });
    }
    return NextResponse.json(settings);
}

export async function PUT(req: Request) {
    const body = await req.json().catch(() => ({}));
    const settings = await prisma.siteSettings.upsert({
        where: { id: "global" },
        update: {
            phone: body.phone,
            instagramUrl: body.instagramUrl,
            truckToday: body.truckToday,
            truckNext: body.truckNext,
        },
        create: {
            id: "global",
            phone: body.phone || "",
            instagramUrl: body.instagramUrl || "",
            truckToday: body.truckToday || "",
            truckNext: body.truckNext || ""
        }
    });
    return NextResponse.json({ ok: true, settings });
}
