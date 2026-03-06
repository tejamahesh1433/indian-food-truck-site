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
            publicEmail: body.publicEmail,
            businessName: body.businessName,
            cityState: body.cityState,
            footerMessage: body.footerMessage,
            bannerEnabled: body.bannerEnabled,
            bannerText: body.bannerText,

            truckToday: body.truckToday,
            truckNext: body.truckNext,

            todayLocation: body.todayLocation,
            todayStart: body.todayStart,
            todayEnd: body.todayEnd,
            todayStatus: body.todayStatus,
            todayNotes: body.todayNotes,

            nextLocation: body.nextLocation,
            nextDate: body.nextDate,
            nextStart: body.nextStart,
            nextEnd: body.nextEnd,
            nextNotes: body.nextNotes,
        },
        create: {
            id: "global",
            phone: body.phone || "",
            instagramUrl: body.instagramUrl || "",
            publicEmail: body.publicEmail || "",
            businessName: body.businessName || "Indian Food Truck",
            cityState: body.cityState || "Hartford, CT",
            footerMessage: body.footerMessage || "",
            bannerEnabled: body.bannerEnabled || false,
            bannerText: body.bannerText || "",

            truckToday: body.truckToday || "",
            truckNext: body.truckNext || "",

            todayLocation: body.todayLocation || "",
            todayStart: body.todayStart || "",
            todayEnd: body.todayEnd || "",
            todayStatus: body.todayStatus || "CLOSED",
            todayNotes: body.todayNotes || "",

            nextLocation: body.nextLocation || "",
            nextDate: body.nextDate || "",
            nextStart: body.nextStart || "",
            nextEnd: body.nextEnd || "",
            nextNotes: body.nextNotes || "",
        }
    });
    return NextResponse.json({ ok: true, settings });
}
