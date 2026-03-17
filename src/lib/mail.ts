import { Resend } from "resend";

export type CateringSelection = string | { name: string };

export async function sendChatLinkEmail({
    email,
    name,
    phone,
    chatLink,
    requestId,
    eventDate,
    guests,
    location,
    notes,
    selections = [],
}: {
    email: string;
    name: string;
    phone?: string;
    chatLink: string;
    requestId: string;
    eventDate?: string;
    guests?: string;
    location?: string;
    notes?: string;
    selections?: CateringSelection[];
}) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn("RESEND_API_KEY is not set. Skipping email send.");
        return;
    }

    const resend = new Resend(apiKey);
    const requestIdShort = requestId.slice(-4).toUpperCase();
    const formattedLocation = location ? location.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : "TBD";

    try {
        console.log(`Attempting to send catering email to: ${email}`);
        
        const selectionsHtml = selections && selections.length > 0 ? `
            <div style="background-color: #f8fafc; border-radius: 20px; padding: 25px; margin-bottom: 25px; border: 1px solid #f1f5f9;">
                <h2 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 12px; margin-top: 0;">Initial Menu Selections</h2>
                <div style="font-size: 14px; color: #444; line-height: 1.5;">
                    ${selections.map(s => `<div style="padding: 4px 0;">• ${typeof s === 'string' ? s : s.name}</div>`).join("")}
                </div>
            </div>
        ` : "";

        const notesHtml = notes ? `
            <div style="background-color: #fffbeb; border-radius: 20px; padding: 25px; margin-bottom: 25px; border: 1px solid #fef3c7;">
                <h2 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #b45309; margin-bottom: 12px; margin-top: 0;">Special Notes & Instructions</h2>
                <div style="font-size: 14px; color: #92400e; line-height: 1.6;">${notes}</div>
            </div>
        ` : "";

        const { data, error } = await resend.emails.send({
            from: "Indian Food Truck <contact@tejainfo.xyz>",
            to: email,
            subject: `Catering Request Received: #CAT-${requestIdShort}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #333;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <div style="background-color: #f97316; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 20px; display: inline-block; font-weight: 900; font-size: 24px; font-style: italic;">IFT</div>
                        <h1 style="font-size: 28px; font-weight: 800; font-style: italic; letter-spacing: -0.05em; margin: 20px 0 10px 0; color: #111; text-transform: uppercase;">Inquiry Received</h1>
                        <div style="display: inline-block; padding: 6px 12px; border-radius: 8px; background-color: #f1f5f9; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                            Request #CAT-${requestIdShort} • Status: New
                        </div>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h2 style="font-size: 20px; font-weight: 800; color: #111; margin-bottom: 12px;">Hi ${name},</h2>
                        <p style="font-size: 15px; line-height: 1.6; color: #444; margin: 0;">
                            Thank you for reaching out! We&apos;ve received your catering inquiry and our team will review it shortly. You can expect a follow-up response within 24 hours.
                        </p>
                    </div>

                    <!-- Contact & Event Summary -->
                    <div style="background-color: #f8fafc; border-radius: 24px; padding: 30px; margin-bottom: 25px; border: 1px solid #f1f5f9;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                            <div>
                                <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 10px; margin-top: 0;">Contact Details</h3>
                                <p style="font-size: 13px; color: #111; margin: 2px 0;"><strong>${name}</strong></p>
                                <p style="font-size: 13px; color: #64748b; margin: 2px 0;">${email}</p>
                                ${phone ? `<p style="font-size: 13px; color: #64748b; margin: 2px 0;">${phone}</p>` : ""}
                            </div>
                            <div>
                                <h3 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 10px; margin-top: 0;">Event Details</h3>
                                <p style="font-size: 13px; color: #111; margin: 2px 0;">${eventDate || "TBD"}</p>
                                <p style="font-size: 13px; color: #64748b; margin: 2px 0;">${guests || "?"} Guests</p>
                                <p style="font-size: 13px; color: #64748b; margin: 2px 0;">@ ${formattedLocation}</p>
                            </div>
                        </div>
                    </div>

                    ${selectionsHtml}
                    ${notesHtml}

                    <div style="text-align: center; margin-bottom: 40px; background-color: #111; padding: 45px 30px; border-radius: 32px; color: white;">
                        <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 12px; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em;">Let&apos;s finalize the details</h3>
                        <p style="font-size: 14px; color: #a1a1aa; margin-bottom: 30px; line-height: 1.5;">
                            Use our secure live chat to update menu choices, guest count, timing, or ask any questions directly to our chefs.
                        </p>
                        <a href="${chatLink}" style="background-color: #f97316; color: white; padding: 18px 36px; text-decoration: none; border-radius: 18px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; transition: background-color 0.2s; box-shadow: 0 10px 20px -10px #f97316;">
                            Open Live Event Chat
                        </a>
                        <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #27272a;">
                            <p style="font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Fallback Contact</p>
                            <p style="font-size: 13px; color: #e4e4e7; margin: 5px 0;">Call/Text: (860) 904-8902</p>
                            <p style="font-size: 11px; color: #52525b; word-break: break-all; margin-top: 10px;">${chatLink}</p>
                        </div>
                    </div>

                    <div style="text-align: center; padding: 0 40px;">
                        <p style="font-size: 12px; color: #94a3b8; line-height: 1.6; font-style: italic;">
                            Note: This is an inquiry summary, not a final invoice. We will provide a formal quote after discussing your specific needs.
                        </p>
                    </div>

                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 40px 0;">
                    
                    <div style="text-align: center;">
                        <p style="font-size: 11px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.1em;">
                            © ${new Date().getFullYear()} Indian Food Truck. Hartford, CT.
                        </p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error("RESEND_ERROR:", error);
        } else {
            console.log("RESEND_SUCCESS:", data);
        }
    } catch (error) {
        console.error("FAILED_TO_SEND_EMAIL_EXCEPTION:", error);
    }
}



export async function sendOrderConfirmationEmail({
    email,
    name,
    orderId,
    amount,
    items,
    trackingLink,
}: {
    email: string;
    name: string;
    orderId: string;
    amount: number;
    items: { name: string; quantity: number; priceCents: number }[];
    trackingLink: string;
}) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn("RESEND_API_KEY is not set. Skipping email send.");
        return;
    }

    const resend = new Resend(apiKey);

    try {
        const orderIdShort = orderId.slice(-6).toUpperCase();
        console.log(`Attempting to send order confirmation to: ${email}`);
        
        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                    <span style="font-weight: bold; color: #111;">${item.quantity}x</span> ${item.name}
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; color: #666; font-family: monospace;">
                    $${(item.priceCents * item.quantity / 100).toFixed(2)}
                </td>
            </tr>
        `).join("");

        const { data, error } = await resend.emails.send({
            from: "Indian Food Truck <contact@tejainfo.xyz>",
            to: email,
            subject: `Order Confirmed: #${orderIdShort} - Indian Food Truck`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #333;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <div style="background-color: #f97316; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 20px; display: inline-block; font-weight: 900; font-size: 24px; font-style: italic;">IFT</div>
                        <h1 style="font-size: 32px; font-weight: 800; font-style: italic; letter-spacing: -0.05em; margin: 20px 0 10px 0; color: #111; text-transform: uppercase;">Order Received!</h1>
                        <p style="color: #666; margin: 0; font-weight: 500;">Order #${orderIdShort} • Ready soon for pickup</p>
                    </div>

                    <div style="background-color: #f8fafc; border-radius: 24px; padding: 30px; margin-bottom: 30px; border: 1px solid #f1f5f9;">
                        <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 20px; margin-top: 0;">Order Summary</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            ${itemsHtml}
                            <tr>
                                <td style="padding-top: 20px; font-weight: 800; font-size: 18px; color: #111; font-style: italic; text-transform: uppercase;">Total</td>
                                <td style="padding-top: 20px; text-align: right; font-weight: 800; font-size: 24px; color: #f97316; font-style: italic;">$${(amount / 100).toFixed(2)}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="text-align: center; margin-bottom: 40px;">
                        <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 25px;">
                            Hi ${name}, our kitchen has received your order and is starting prep! You can track your order status and chat with us directly below.
                        </p>
                        <a href="${trackingLink}" style="background-color: #111; color: white; padding: 18px 36px; text-decoration: none; border-radius: 18px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; transition: background-color 0.2s;">
                            Track & Chat with Chef
                        </a>
                    </div>

                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 40px 0;">
                    
                    <div style="text-align: center;">
                        <p style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">Pickup Location</p>
                        <p style="font-size: 14px; font-weight: 600; color: #444; margin: 0;">Check our website for current truck location</p>
                        <p style="font-size: 12px; color: #cbd5e1; margin-top: 30px;">
                            © ${new Date().getFullYear()} Indian Food Truck. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error("ORDER_EMAIL_ERROR:", error);
        } else {
            console.log("ORDER_EMAIL_SUCCESS:", data);
        }
    } catch (error) {
        console.error("FAILED_TO_SEND_ORDER_EMAIL_EXCEPTION:", error);
    }
}
