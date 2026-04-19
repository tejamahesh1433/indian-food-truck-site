import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

    // Server-side validation
    if (body.bannerEnabled && !body.bannerText?.trim()) {
        return NextResponse.json({ ok: false, error: "Banner text is required when enabled." }, { status: 400 });
    }

    if (body.publicEmail && !body.publicEmail.includes("@")) {
        return NextResponse.json({ ok: false, error: "Invalid email format." }, { status: 400 });
    }

    if (body.instagramUrl && !body.instagramUrl.includes("instagram.com")) {
        return NextResponse.json({ ok: false, error: "Must be a valid Instagram URL." }, { status: 400 });
    }

    const settings = await prisma.siteSettings.upsert({
        where: { id: "global" },
        update: {
            phone: body.phone?.trim() || "",
            instagramUrl: body.instagramUrl?.trim() || "",
            publicEmail: body.publicEmail?.trim() || "",
            businessName: body.businessName?.trim() || "",
            cityState: body.cityState?.trim() || "",
            footerMessage: body.footerMessage?.trim() || "",
            bannerEnabled: body.bannerEnabled,
            bannerText: body.bannerText?.trim() || "",
            logoUrl: body.logoUrl?.trim() || "",

            truckToday: body.truckToday,
            truckNext: body.truckNext,

            todayLocation: body.todayLocation,
            todayStart: body.todayStart,
            todayEnd: body.todayEnd,
            todayStatus: body.todayStatus,
            todayNotes: body.todayNotes,
            
            weeklySchedule: body.weeklySchedule ?? null,
            ...(body.adminAccessPin !== undefined && { adminAccessPin: body.adminAccessPin?.trim() || "" }),
        },
        create: {
            id: "global",
            phone: body.phone?.trim() || "",
            instagramUrl: body.instagramUrl?.trim() || "",
            publicEmail: body.publicEmail?.trim() || "",
            businessName: body.businessName?.trim() || "Indian Food Truck",
            cityState: body.cityState?.trim() || "Hartford, CT",
            footerMessage: body.footerMessage?.trim() || "",
            bannerEnabled: body.bannerEnabled || false,
            bannerText: body.bannerText?.trim() || "",
            logoUrl: body.logoUrl?.trim() || "",

            truckToday: body.truckToday || "",
            truckNext: body.truckNext || "",

            todayLocation: body.todayLocation || "",
            todayStart: body.todayStart || "",
            todayEnd: body.todayEnd || "",
            todayStatus: body.todayStatus || "CLOSED",
            todayNotes: body.todayNotes || "",
            
            weeklySchedule: body.weeklySchedule ?? null,
        }
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true, settings });
}

export async function PATCH(req: Request) {
    const body = await req.json().catch(() => ({}));

    // Handle email settings updates
    const emailSettingsKeys = [
        'emailOrderStatusUpdates',
        'emailNewsletterSend',
        'emailVerificationRequired',
        'emailAdminAlerts'
    ];

    const updateData: any = {};
    emailSettingsKeys.forEach(key => {
        if (body[key] !== undefined) {
            updateData[key] = body[key];
        }
    });

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ ok: false, error: "No settings to update" }, { status: 400 });
    }

    const settings = await prisma.siteSettings.upsert({
        where: { id: "global" },
        update: updateData,
        create: {
            id: "global",
            ...updateData
        }
    });

    revalidatePath("/admin/settings", "page");

    return NextResponse.json({ ok: true, settings });
}
