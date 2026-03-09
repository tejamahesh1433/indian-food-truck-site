"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(id: string, status: OrderStatus) {
    await prisma.order.update({
        where: { id },
        data: { status }
    });
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
}
