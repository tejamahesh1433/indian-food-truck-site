import Navbar from "@/components/Navbar";
import MenuTabs from "@/components/MenuTabs";
import StickyCall from "@/components/StickyCall";

export default function MenuPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            <MenuTabs />
            <StickyCall />
        </main>
    );
}
