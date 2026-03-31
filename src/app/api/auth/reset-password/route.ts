import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

import { z } from "zod";

const ResetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, newPassword } = ResetPasswordSchema.parse(body);

        // Find the token
        const resetTokenRecord = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetTokenRecord) {
            return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
        }

        // Check expiration
        if (new Date() > resetTokenRecord.expiresAt) {
            // Expired, delete it and error
            await prisma.passwordResetToken.delete({ where: { token } });
            return NextResponse.json({ error: "Reset token has expired. Please request a new one." }, { status: 400 });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: resetTokenRecord.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User no longer exists." }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 12);

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        // Delete used token
        await prisma.passwordResetToken.delete({
            where: { token },
        });

        return NextResponse.json({ success: true, message: "Password updated successfully." });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error("RESET_PASSWORD_ERROR:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
