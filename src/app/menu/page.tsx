import Navbar from "@/components/Navbar";
import MenuTabs from "@/components/MenuTabs";

export default function MenuPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            <MenuTabs />
        </main>
    );
}
