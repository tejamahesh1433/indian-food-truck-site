import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { subject, htmlContent, textContent } = await req.json();

        // Check if email sending is enabled in settings
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "global" },
        });

        if (!settings?.emailNewsletterSend) {
            return NextResponse.json(
                { error: "Newsletter sending is disabled in settings" },
                { status: 403 }
            );
        }

        if (!subject || !htmlContent) {
            return NextResponse.json(
                { error: "Subject and htmlContent are required" },
                { status: 400 }
            );
        }

        // Get all newsletter subscribers
        const subscribers = await prisma.newsletterSubscriber.findMany({
            select: { email: true, name: true },
        });

        if (subscribers.length === 0) {
            return NextResponse.json(
                { error: "No subscribers found" },
                { status: 400 }
            );
        }

        const publicEmail = settings.publicEmail || "noreply@example.com";

        // Send emails to all subscribers
        const results = await Promise.allSettled(
            subscribers.map((subscriber) =>
                resend.emails.send({
                    from: publicEmail,
                    to: subscriber.email,
                    subject,
                    html: htmlContent,
                    text: textContent || htmlContent.replace(/<[^>]*>/g, ""),
                    headers: {
                        "List-Unsubscribe": `<mailto:${publicEmail}?subject=unsubscribe>`,
                    },
                })
            )
        );

        const successCount = results.filter((r) => r.status === "fulfilled").length;
        const failureCount = results.filter((r) => r.status === "rejected").length;

        return NextResponse.json({
            success: true,
            sent: successCount,
            failed: failureCount,
            total: subscribers.length,
            message: `Newsletter sent to ${successCount}/${subscribers.length} subscribers`,
        });
    } catch (error) {
        console.error("Error sending newsletter:", error);
        return NextResponse.json(
            { error: "Failed to send newsletter" },
            { status: 500 }
        );
    }
}
