import { Resend } from "resend";

export async function sendChatLinkEmail({
    email,
    name,
    chatLink,
}: {
    email: string;
    name: string;
    chatLink: string;
}) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn("RESEND_API_KEY is not set. Skipping email send.");
        return;
    }

    const resend = new Resend(apiKey);

    try {
        console.log(`Attempting to send catering email to: ${email}`);
        const { data, error } = await resend.emails.send({
            from: "Indian Food Truck <contact@tejainfo.xyz>",
            to: email,
            subject: "Your Catering Chat Link - Indian Food Truck",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #f97316;">Hi ${name}!</h2>
                    <p>Thank you for your catering request. We've received your details and would love to chat with you about the event.</p>
                    <p>You can use the link below to chat directly with us and track the status of your quote:</p>
                    <div style="margin: 30px 0;">
                        <a href="${chatLink}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Open Live Chat
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #666;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${chatLink}" style="color: #f97316;">${chatLink}</a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">
                        This is an automated message. Please use the link above to reply.
                    </p>
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
