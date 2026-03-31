import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return NextResponse.json(
                { error: "No account found with this email address. Please check your spelling or register for a new account." },
                { status: 404 }
            );
        }

        // Generate a secure random token
        const token = crypto.randomBytes(32).toString("hex");

        // Set expiration for 1 hour from now
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

        // Delete any existing tokens for this email to prevent spam/confusion
        await prisma.passwordResetToken.deleteMany({
            where: { email: user.email! },
        });

        // Save new token to database
        await prisma.passwordResetToken.create({
            data: {
                email: user.email!,
                token,
                expiresAt,
            },
        });

        // Use the public base URL if defined (e.g. https://tejainfo.xyz), otherwise fallback to localhost
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        // Send email
        await sendPasswordResetEmail({
            email: user.email!,
            resetLink,
        });

        return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    } catch (error) {
        console.error("FORGOT_PASSWORD_ERROR:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
