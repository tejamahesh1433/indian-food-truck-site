import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: "Invalid request. Password must be at least 6 characters." }, { status: 400 });
        }

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
        console.error("RESET_PASSWORD_ERROR:", error);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}
