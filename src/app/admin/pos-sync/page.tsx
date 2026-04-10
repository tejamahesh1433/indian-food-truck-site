import { prisma } from "@/lib/prisma";
import PosSyncDashboard from "./PosSyncDashboard";
import { getPOSManager } from "@/lib/pos/manager";

export const dynamic = "force-dynamic";

export default async function PosSyncPage() {
    // Fetch items marked for POS
    const posItems = await prisma.menuItem.findMany({
        where: { inPos: true },
        orderBy: { name: "asc" },
        select: {
            id: true,
            name: true,
            category: true,
            priceCents: true,
            isAvailable: true,
            inPos: true,
            updatedAt: true
        }
    });

    const posManager = getPOSManager();
    const initialStatus = posManager.getStatus();

    return (
        <PosSyncDashboard 
            initialItems={posItems} 
            initialStatus={initialStatus}
        />
    );
}
