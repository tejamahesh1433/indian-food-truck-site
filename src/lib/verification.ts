import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string) {
    try {
        // 1. Fetch site settings to see if verification is required
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "global" },
        });

        // If not required by settings, we don't send anything
        if (!settings?.emailVerificationRequired) {
            return { success: true, message: "Email verification not required" };
        }

        // 2. Check if user exists and is not already verified
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { error: "User not found" };
        }

        if (user.emailVerified) {
            return { success: true, message: "Email already verified" };
        }

        // 3. Create or update verification token
        // Use a more robust token generation than Math.random
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Clean up old tokens for this email
        await prisma.verificationToken.deleteMany({
            where: { identifier: email },
        });

        await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires: expiresAt,
            },
        });

        // 4. Send the email
        const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}&email=${email}`;
        const businessName = settings.businessName || "Indian Food Truck";
        const publicEmail = settings.publicEmail || "contact@tejainfo.xyz";

        await resend.emails.send({
            from: `${businessName} <${publicEmail}>`,
            to: email,
            subject: `Verify Your Email - ${businessName}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #333;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <div style="background-color: #f97316; color: white; width: 60px; height: 60px; line-height: 60px; border-radius: 20px; display: inline-block; font-weight: 900; font-size: 24px; font-style: italic;">${businessName.charAt(0)}</div>
                        <h1 style="font-size: 28px; font-weight: 800; font-style: italic; letter-spacing: -0.05em; margin: 20px 0 10px 0; color: #111; text-transform: uppercase;">Verify Your Email</h1>
                    </div>

                    <div style="background-color: #f8fafc; border-radius: 24px; padding: 30px; margin-bottom: 30px; border: 1px solid #f1f5f9; text-align: center;">
                        <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 25px;">
                            Thanks for signing up at ${businessName}! To finalize your account and start ordering, please confirm your email address below.
                        </p>
                        
                        <a href="${verificationLink}" style="background-color: #f97316; color: white; padding: 18px 36px; text-decoration: none; border-radius: 18px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; transition: background-color 0.2s;">
                            Verify My Email
                        </a>
                        
                        <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">
                            This link will expire in 24 hours.
                        </p>
                    </div>

                    <div style="text-align: center;">
                        <p style="font-size: 11px; color: #cbd5e1; margin-top: 30px; text-transform: uppercase; letter-spacing: 0.1em;">
                            If you didn't create an account, you can safely ignore this email.
                        </p>
                        <p style="font-size: 12px; color: #cbd5e1; margin-top: 10px;">
                            © ${new Date().getFullYear()} ${businessName}.
                        </p>
                    </div>
                </div>
            `,
        });

        return { success: true, message: "Verification email sent" };
    } catch (error) {
        console.error("sendVerificationEmail Error:", error);
        return { error: "Failed to send verification email" };
    }
}
