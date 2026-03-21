import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ReviewSchema = z.object({
    name: z.string().min(2).max(60),
    rating: z.number().int().min(1).max(5),
    text: z.string().min(10).max(500),
});

// GET: approved reviews for homepage
export async function GET() {
    try {
        const reviews = await prisma.review.findMany({
            where: { isApproved: true },
            orderBy: { createdAt: "desc" },
            take: 12,
        });
        return NextResponse.json({ reviews });
    } catch {
        return NextResponse.json({ reviews: [] });
    }
}

// POST: submit a new review (pending approval)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = ReviewSchema.parse(body);

        const review = await prisma.review.create({
            data: {
                name: data.name,
                rating: data.rating,
                text: data.text,
                isApproved: false,
            },
        });

        return NextResponse.json({ success: true, id: review.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Please check your review and try again." }, { status: 400 });
        }
        return NextResponse.json({ error: "Could not submit review. Please try again." }, { status: 500 });
    }
}
