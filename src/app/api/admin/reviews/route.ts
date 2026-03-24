import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all reviews (admin)
export async function GET() {
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ reviews });
}

// PATCH approve/reject
export async function PATCH(req: Request) {
    const { id, isApproved } = await req.json();
    await prisma.review.update({ where: { id }, data: { isApproved } });
    return NextResponse.json({ success: true });
}

// DELETE
export async function DELETE(req: Request) {
    const { id } = await req.json();
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
