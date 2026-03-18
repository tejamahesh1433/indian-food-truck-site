import { Resend } from "resend";

export type CateringSelection = {
    name: string;
    quantity: number;
    priceLabel: string;
    pricePerUnit: number;
    options: { [key: string]: string | number };
};

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

    // Pricing logic
    const subtotal = selections.reduce((acc, s) => acc + (s.pricePerUnit * s.quantity), 0);
    const taxRate = 0.0635; // CT standard
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    try {
        console.log(`Attempting to send catering email to: ${email}`);

        const selectionsHtml = selections && selections.length > 0 ? `
            <div style="background-color: #ffffff; border-radius: 24px; padding: 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <h2 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #f97316; margin-bottom: 20px; margin-top: 0;">Initial Menu Summary</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #f1f5f9;">
                            <th style="text-align: left; padding: 12px 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Item Particulars</th>
                            <th style="text-align: right; padding: 12px 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${selections.map(s => {
                            const optionsText = Object.entries(s.options)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" • ");
                            return `
                                <tr>
                                    <td style="padding: 16px 0; border-bottom: 1px solid #f8fafc;">
                                        <div style="font-size: 15px; font-weight: 700; color: #111;">${s.name}</div>
                                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${s.quantity}x • ${optionsText}</div>
                                    </td>
                                    <td style="padding: 16px 0; border-bottom: 1px solid #f8fafc; text-align: right; font-size: 14px; font-weight: 600; color: #111;">
                                        $${(s.pricePerUnit * s.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>

                <!-- Price Breakdown -->
                <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #f1f5f9;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 13px; color: #64748b;">Subtotal</span>
                        <span style="font-size: 13px; font-weight: 600; color: #111;">$${subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span style="font-size: 13px; color: #64748b;">Estimated Tax (6.35%)</span>
                        <span style="font-size: 13px; font-weight: 600; color: #111;">$${tax.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px dashed #e2e8f0;">
                        <span style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #111;">Estimated Total</span>
                        <span style="font-size: 20px; font-weight: 900; color: #f97316;">$${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        ` : "";

        const notesHtml = notes ? `
            <div style="background-color: #ffffff; border-radius: 24px; padding: 32px; margin-bottom: 24px; border: 1px solid #fff7ed; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);">
                <h2 style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #d97706; margin-bottom: 12px; margin-top: 0;">Special Notes & Instructions</h2>
                <div style="font-size: 14px; color: #444; line-height: 1.7; font-style: italic;">"${notes}"</div>
            </div>
        ` : "";

        const { data, error } = await resend.emails.send({
            from: "Indian Food Truck <contact@tejainfo.xyz>",
            to: email,
            subject: `Catering Request Received: #CAT-${requestIdShort}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fcfcfc; color: #333;">
                    <!-- Logo / Header -->
                    <div style="text-align: center; margin-bottom: 40px;">
                        <div style="background-color: #f97316; color: white; width: 64px; height: 64px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; font-style: italic; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3);">
                            <span style="margin-top: 18px; display: block;">IFT</span>
                        </div>
                        <h1 style="font-size: 24px; font-weight: 900; margin: 24px 0 8px 0; color: #111; text-transform: uppercase; letter-spacing: -0.02em;">Request Received</h1>
                        <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">
                            Ref: #CAT-${requestIdShort} • Status: Under Review
                        </div>
                    </div>

                    <!-- Intro Card -->
                    <div style="background-color: #ffffff; border-radius: 24px; padding: 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <h2 style="font-size: 20px; font-weight: 800; color: #111; margin-bottom: 12px; margin-top: 0;">Hi ${name},</h2>
                        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0;">
                            Thank you for your interest in our catering! We've received your inquiry and our chefs are already taking a look. We'll build a custom quote for you and reach out via the live chat portal shortly.
                        </p>
                    </div>

                    <!-- Summary Grid -->
                    <div style="background-color: #ffffff; border-radius: 24px; padding: 32px; margin-bottom: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <div style="display: flex; flex-wrap: wrap; gap: 32px;">
                            <div style="flex: 1; min-width: 200px;">
                                <h3 style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 12px; margin-top: 0;">Contact Profile</h3>
                                <div style="font-size: 14px; font-weight: 700; color: #111; margin-bottom: 4px;">${name}</div>
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">${email}</div>
                                ${phone ? `<div style="font-size: 13px; color: #64748b;">${phone}</div>` : ""}
                            </div>
                            <div style="flex: 1; min-width: 200px;">
                                <h3 style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 12px; margin-top: 0;">Event Details</h3>
                                <div style="font-size: 14px; font-weight: 700; color: #111; margin-bottom: 4px;">${eventDate || "TBD"}</div>
                                <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">${guests || "?"} Estimated Guests</div>
                                <div style="font-size: 13px; color: #64748b;">@ ${formattedLocation}</div>
                            </div>
                        </div>
                    </div>

                    ${selectionsHtml}
                    ${notesHtml}

                    <!-- CTA Section -->
                    <div style="text-align: center; margin-bottom: 40px; background-color: #111; padding: 48px 32px; border-radius: 32px; color: white; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                        <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 12px; font-style: italic; text-transform: uppercase; letter-spacing: 0.05em;">Personalize Your Package</h3>
                        <p style="font-size: 14px; color: #a1a1aa; margin-bottom: 32px; line-height: 1.6;">
                            Need to adjust guest counts, change menu choices, or discuss dietary requirements? Hop on our live chat for immediate assistance.
                        </p>
                        <a href="${chatLink}" style="background-color: #f97316; color: white; padding: 20px 40px; text-decoration: none; border-radius: 20px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; box-shadow: 0 10px 20px -10px rgba(249, 115, 22, 0.5);">
                            Open Live Discussion
                        </a>
                        <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #27272a;">
                            <p style="font-size: 10px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 12px;">Direct Support</p>
                            <p style="font-size: 14px; color: #e4e4e7; margin: 8px 0; font-weight: 700;">(860) 904-8902</p>
                            <p style="font-size: 11px; color: #52525b; word-break: break-all; margin-top: 16px;">${chatLink}</p>
                        </div>
                    </div>

                    <!-- Final Note -->
                    <div style="text-align: center; padding: 0 24px;">
                        <div style="display: inline-block; padding: 8px 16px; border-radius: 12px; background-color: #f8fafc; border: 1px solid #f1f5f9; margin-bottom: 24px;">
                            <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin: 0; font-style: italic;">
                                <strong>Important:</strong> This is a summary of your inquiry and estimated pricing. Final figures (including delivery and service fees) will be confirmed in your formal proposal.
                            </p>
                        </div>
                    </div>

                    <div style="border-top: 1px solid #f1f5f9; padding-top: 32px; text-align: center;">
                        <p style="font-size: 10px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.2em; margin: 0;">
                            © ${new Date().getFullYear()} INDIAN FOOD TRUCK • HARTFORD, CT
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

export async function sendOrderNotificationToAdmin({
    adminEmail,
    order,
    adminLink,
}: {
    adminEmail: string;
    order: {
        id: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        totalAmount: number;
        items: { name: string; quantity: number; priceCents: number }[];
    };
    adminLink: string;
}) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;

    const resend = new Resend(apiKey);
    const orderIdShort = order.id.slice(-6).toUpperCase();

    try {
        const itemsList = order.items.map(item => 
            `<li><strong>${item.quantity}x</strong> ${item.name} ($${(item.priceCents * item.quantity / 100).toFixed(2)})</li>`
        ).join("");

        await resend.emails.send({
            from: "Indian Food Truck <contact@tejainfo.xyz>",
            to: adminEmail,
            subject: `🚨 NEW ORDER: #${orderIdShort} - $${(order.totalAmount / 100).toFixed(2)}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #f97316; padding: 24px; border-radius: 16px;">
                    <h1 style="color: #f97316; margin-top: 0;">New Order Received!</h1>
                    <p style="font-size: 18px; font-weight: bold;">Order #${orderIdShort}</p>
                    
                    <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 16px 0;">
                        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-top: 0;">Customer Info</h2>
                        <p style="margin: 4px 0;"><strong>Name:</strong> ${order.customerName}</p>
                        <p style="margin: 4px 0;"><strong>Email:</strong> ${order.customerEmail}</p>
                        <p style="margin: 4px 0;"><strong>Phone:</strong> ${order.customerPhone}</p>
                    </div>

                    <div style="margin: 16px 0;">
                        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b;">Order Items</h2>
                        <ul style="padding-left: 20px;">
                            ${itemsList}
                        </ul>
                        <p style="font-size: 20px; font-weight: bold; color: #f97316;">Total: $${(order.totalAmount / 100).toFixed(2)}</p>
                    </div>

                    <a href="${adminLink}" style="display: inline-block; background: #111; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;">
                        View in Admin Dashboard
                    </a>
                </div>
            `
        });
    } catch (error) {
        console.error("FAILED_TO_SEND_ADMIN_NOTIFICATION:", error);
    }
}
