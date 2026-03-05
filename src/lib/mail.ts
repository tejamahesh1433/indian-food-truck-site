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
            from: "Indian Food Truck <onboarding@resend.dev>",
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
