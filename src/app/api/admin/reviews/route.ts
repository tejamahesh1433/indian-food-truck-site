import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all reviews (admin)
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ reviews });
}

// PATCH approve/reject
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, isApproved } = await req.json();
    await prisma.review.update({ where: { id }, data: { isApproved } });
    return NextResponse.json({ success: true });
}

// DELETE
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
