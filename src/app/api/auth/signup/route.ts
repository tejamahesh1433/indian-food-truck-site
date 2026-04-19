import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { isWellRecognizedEmail, EMAIL_DOMAIN_ERROR } from "@/lib/validation";

const SignupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = SignupSchema.parse(body);

        if (!isWellRecognizedEmail(email)) {
            return NextResponse.json({ error: EMAIL_DOMAIN_ERROR }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists with this email" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                // If verification is not required, we can mark it as verified immediately 
                // but usually we wait for the trigger. 
                // For now, let's keep it null and trigger the email.
            }
        });

        // 5. Trigger Verification if required
        const { sendVerificationEmail } = await import("@/lib/verification");
        const verificationResult = await sendVerificationEmail(email);

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            verificationPending: verificationResult.success && verificationResult.message !== "Email verification not required",
            message: verificationResult.error || verificationResult.message
        }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error("SIGNUP_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
