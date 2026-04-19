import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Send verification email
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        const { sendVerificationEmail } = await import("@/lib/verification");
        const result = await sendVerificationEmail(email);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error sending verification email:", error);
        return NextResponse.json(
            { error: "Failed to send verification email" },
            { status: 500 }
        );
    }
}

// Verify email token
export async function GET(req: NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get("token");
        const email = req.nextUrl.searchParams.get("email");

        if (!token || !email) {
            return NextResponse.json(
                { error: "Token and email are required" },
                { status: 400 }
            );
        }

        // Find and verify token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken || verificationToken.identifier !== email) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 400 }
            );
        }

        if (verificationToken.expires < new Date()) {
            return NextResponse.json(
                { error: "Token expired" },
                { status: 400 }
            );
        }

        // Mark email as verified
        await prisma.user.update({
            where: { email },
            data: { emailVerified: new Date() },
        });

        // Delete used token
        await prisma.verificationToken.delete({
            where: { token },
        });

        return NextResponse.json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("Error verifying email:", error);
        return NextResponse.json(
            { error: "Failed to verify email" },
            { status: 500 }
        );
    }
}
