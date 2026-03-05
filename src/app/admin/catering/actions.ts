"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCateringStatus(id: string, status: string) {
    await prisma.cateringRequest.update({
        where: { id },
        data: { status },
    });
    revalidatePath("/admin/catering");
}

export async function updateInternalNotes(id: string, internalNotes: string) {
    await prisma.cateringRequest.update({
        where: { id },
        data: { internalNotes },
    });
    revalidatePath("/admin/catering");
}

export async function archiveCateringRequest(id: string) {
    await prisma.cateringRequest.update({
        where: { id },
        data: { isArchived: true },
    });
    revalidatePath("/admin/catering");
}

export async function deleteCateringRequest(id: string) {
    await prisma.cateringRequest.delete({ where: { id } });
    revalidatePath("/admin/catering");
}
