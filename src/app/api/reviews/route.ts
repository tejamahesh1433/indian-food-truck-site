import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isAdmin } from "@/lib/adminAuth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ReviewSchema = z.object({
    name: z.string().min(2).max(60),
    rating: z.number().int().min(1).max(5),
    text: z.string().min(3).max(500),
    orderId: z.string().optional(),
    menuItemId: z.string().optional(),
});

const BulkReviewSchema = z.union([ReviewSchema, z.array(ReviewSchema)]);

// GET: approved reviews for homepage
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    try {
        const where: any = { isApproved: true };
        
        // If type is 'general', only show reviews without a menuItemId
        if (type === "general") {
            where.menuItemId = null;
        }

        const reviews = await prisma.review.findMany({
            where,
            orderBy: { createdAt: "desc" },
            // Take 50 to allow frontend to handle 'Load More' without many network calls initially
            take: 50,
        });
        return NextResponse.json({ reviews });
    } catch (error) {
        console.error("GET_REVIEWS_ERROR:", error);
        return NextResponse.json({ reviews: [] });
    }
}

// POST: submit a new review (pending approval)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const parsed = BulkReviewSchema.parse(body);

        // Auto-approve if the submitter is an admin
        const isAutoApproved = await isAdmin();

        // Get user ID from session if logged in
        let userId: string | null = null;
        if (session?.user?.id) {
            userId = session.user.id;
        } else if (session?.user?.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });
            if (user) userId = user.id;
        }

        const reviewsData = Array.isArray(parsed) ? parsed : [parsed];

        // Process all reviews with existence check
        const createdReviews = await Promise.all(
            reviewsData.map(async (data: any) => {
                // If they provided an orderId and menuItemId, check if they already reviewed this combo
                if (data.orderId && data.menuItemId && userId) {
                    const existing = await prisma.review.findFirst({
                        where: {
                            orderId: data.orderId,
                            menuItemId: data.menuItemId,
                            userId: userId
                        }
                    });

                    if (existing) {
                        console.log(`[SKIP_DUPLICATE] Review already exists for order ${data.orderId}, item ${data.menuItemId}`);
                        return null; // Skip this one
                    }
                }

                return prisma.review.create({
                    data: {
                        name: data.name,
                        rating: data.rating,
                        text: data.text,
                        isApproved: isAutoApproved,
                        orderId: data.orderId || null,
                        menuItemId: data.menuItemId || null,
                        userId: userId || null,
                    },
                });
            })
        );

        const successfulCount = createdReviews.filter(r => r !== null).length;

        return NextResponse.json({ 
            success: true, 
            count: successfulCount,
            skipped: reviewsData.length - successfulCount,
            isApproved: isAutoApproved 
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
            return NextResponse.json({ error: `Validation failed: ${issues}. Please ensure comments are at least 3 characters.` }, { status: 400 });
        }
        
        console.error("REVIEW_SUBMISSION_ERROR_LOG:", error);
        
        // Return more specific error if possible
        const errorMessage = error instanceof Error ? error.message : "Internal Database Error";
        return NextResponse.json({ 
            error: "Could not submit review. Please try again.",
            details: errorMessage 
        }, { status: 500 });
    }
}
