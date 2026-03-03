import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAdminToken, getAdminCookieName } from "@/lib/adminAuth";

async function checkAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminCookieName())?.value;
    if (!token) return false;
    try {
        verifyAdminToken(token);
        return true;
    } catch {
        return false;
    }
}

export async function GET() {
    if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.menuItem.findMany({
        orderBy: { category: "asc" }
    });
    return NextResponse.json(items);
}

export async function POST(req: Request) {
    if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const newItem = await prisma.menuItem.create({
        data: {
            name: data.name,
            description: data.description,
            priceCents: parseInt(data.priceCents),
            imageUrl: data.imageUrl,
            category: data.category,
            tags: data.tags || [],
            isAvailable: data.isAvailable ?? true,
        }
    });

    return NextResponse.json(newItem);
}

export async function PUT(req: Request) {
    if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const updated = await prisma.menuItem.update({
        where: { id: data.id },
        data: {
            name: data.name,
            description: data.description,
            priceCents: parseInt(data.priceCents),
            imageUrl: data.imageUrl,
            category: data.category,
            tags: data.tags,
            isAvailable: data.isAvailable,
        }
    });

    return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
    if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.menuItem.delete({
        where: { id }
    });

    return NextResponse.json({ success: true });
}
