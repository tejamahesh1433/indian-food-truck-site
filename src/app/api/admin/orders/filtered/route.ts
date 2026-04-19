import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        const page = Number(searchParams.get("page")) || 1;
        const pageSize = 15;
        const skip = (page - 1) * pageSize;

        // Build filter conditions
        const where: any = {};

        // Filter by status
        if (status && status !== "ALL") {
            where.status = status as OrderStatus;
        }

        // Filter by date range
        if (dateFrom) {
            where.createdAt = {
                ...where.createdAt,
                gte: new Date(dateFrom),
            };
        }
        if (dateTo) {
            const endOfDay = new Date(dateTo);
            endOfDay.setHours(23, 59, 59, 999);
            where.createdAt = {
                ...where.createdAt,
                lte: endOfDay,
            };
        }

        // Search by customer name, email, or phone
        if (search) {
            where.OR = [
                { customerName: { contains: search, mode: "insensitive" } },
                { customerEmail: { contains: search, mode: "insensitive" } },
                { customerPhone: { contains: search, mode: "insensitive" } },
                { id: { contains: search, mode: "insensitive" } },
            ];
        }

        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: "desc" },
                include: { items: true },
            }),
            prisma.order.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / pageSize);

        return NextResponse.json({
            orders,
            totalCount,
            totalPages,
            page,
            pageSize,
        });
    } catch (error) {
        console.error("Error fetching filtered orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
