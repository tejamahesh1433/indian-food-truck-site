import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type } = body;

        const settings = await prisma.siteSettings.findUnique({
            where: { id: "global" }
        });

        if (!settings?.publicEmail) {
            return NextResponse.json({ ok: false, error: "Branding/Contact email not configured. Add it in the section above first." }, { status: 400 });
        }

        const testEmail = settings.publicEmail;

        if (type === "emailOrderStatusUpdates") {
            await sendOrderConfirmationEmail({
                email: testEmail,
                name: "Test Customer",
                orderId: "TEST-1234",
                amount: 2500, // $25.00
                items: [
                    { name: "Test Chicken Tikka", quantity: 2, priceCents: 1000 },
                    { name: "Test Garlic Naan", quantity: 1, priceCents: 500 }
                ],
                trackingLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/order/TEST-1234`
            });
        } else if (type === "emailAdminAlerts") {
            await sendOrderNotificationToAdmin({
                adminEmail: testEmail,
                order: {
                    id: "TEST-ADMIN",
                    customerName: "Real-time Test",
                    customerEmail: testEmail,
                    customerPhone: "+1 555-0199",
                    totalAmount: 1550,
                    items: [
                        { name: "Paneer Kofta", quantity: 1, priceCents: 1550 }
                    ]
                },
                adminLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/orders`
            });
        } else if (type === "emailNewsletterSend") {
            // Simplest test for newsletter
            console.log("Sending newsletter test to:", testEmail);
            // We can add a more specific newsletter test function later if needed
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("TEST_EMAIL_ERROR:", error);
        return NextResponse.json({ ok: false, error: "Failed to send test email" }, { status: 500 });
    }
}
