import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import OrderTrackingList from "../../components/OrderTrackingList";
import ProfileHeader from "./ProfileHeader";
import StatsCards from "./StatsCards";
import InvoicesSection from "./InvoicesSection";
import FavoritesSection from "./FavoritesSection";
import SavedLocationsSection from "./SavedLocationsSection";
import ReviewsSection from "./ReviewsSection";
import AccountSettings from "./AccountSettings";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login?callbackUrl=/profile");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: {
            orders: {
                orderBy: { createdAt: "desc" },
                include: {
                    items: {
                        include: {
                            menuItem: true
                        }
                    },
                    reviews: {
                        select: {
                            id: true,
                            rating: true,
                            text: true,
                            menuItemId: true,
                            createdAt: true
                        }
                    }
                }
            },
            favorites: {
                include: {
                    menuItem: true
                }
            },
            savedLocations: true
        }
    });

    if (!user) {
        redirect("/login");
    }

    // Check if email verification is required and if the user is verified
    const settings = await prisma.siteSettings.findUnique({
        where: { id: "global" },
        select: { emailVerificationRequired: true }
    });

    if (settings?.emailVerificationRequired && !user.emailVerified) {
        redirect("/verify-email/pending");
    }

    const totalSpent = user.orders
        .filter(o => o.status === "COMPLETED")
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const memberSince = user.createdAt?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
    }) || 'Recently';

    const completedOrders = user.orders.filter(o => o.status === "COMPLETED").length;

    return (
        <main className="min-h-screen pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
            {/* Back Link */}
            <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-orange-500 transition mb-8 group"
            >
                <svg className="h-3 w-3 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Menu
            </Link>

            {/* Profile Header with Stats */}
            <ProfileHeader user={user} memberSince={memberSince} />

            {/* Stats Dashboard */}
            <StatsCards
                totalOrders={user.orders.length}
                completedOrders={completedOrders}
                totalSpent={totalSpent}
                memberSince={memberSince}
            />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* Invoices Section */}
                    <InvoicesSection orders={user.orders} />

                    {/* Order History */}
                    <OrderHistorySection orders={user.orders} />

                    {/* Reviews Section */}
                    <ReviewsSection orders={user.orders} />
                </div>

                {/* Right Sidebar — on mobile renders AFTER main content */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Favorites */}
                    <FavoritesSection favorites={user.favorites} />

                    {/* Saved Locations */}
                    <SavedLocationsSection locations={user.savedLocations} />

                    {/* Account Settings — remove sticky on mobile */}
                    <AccountSettings user={user} />
                </div>
            </div>
        </main>
    );
}

function OrderHistorySection({ orders }: { orders: Record<string, unknown>[] }) {
    return (
        <section id="order-history-section" className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">Order History</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                    {orders.length} Total
                </span>
            </div>

            {orders.length === 0 ? (
                <div className="py-16 text-center rounded-2xl border border-dashed border-white/10 bg-white/5">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-6">No orders yet. Let&apos;s change that!</p>
                    <Link href="/menu" className="inline-block bg-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition">
                        View Menu
                    </Link>
                </div>
            ) : (
                <OrderTrackingList initialOrders={JSON.parse(JSON.stringify(orders))} />
            )}
        </section>
    );
}
