import Navbar from "@/components/Navbar";
import MenuTabs from "@/components/MenuTabs";
import { headers } from "next/headers";

export const revalidate = 60; // Cache the whole page for 60 seconds

export default async function MenuPage() {
    // Get the base URL from headers or env
    const host = (await headers()).get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // Fetch data on the server
    let items = [];
    let categories = ["All"];

    try {
        const [itemsRes, catsRes] = await Promise.all([
            fetch(`${baseUrl}/api/menu-items`),
            fetch(`${baseUrl}/api/categories`)
        ]);

        if (itemsRes.ok) {
            const data = await itemsRes.json();
            items = data.items || [];
        }
        if (catsRes.ok) {
            const data = await catsRes.json();
            categories = ["All", ...(data.categories || [])];
        }
    } catch (err) {
        console.error("Failed to pre-fetch menu data on server", err);
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            <MenuTabs initialItems={items} initialCategories={categories} />
        </main>
    );
}
