"use client";

interface ReviewsSectionProps {
    orders: any[];
}

export default function ReviewsSection({ orders }: ReviewsSectionProps) {
    // Collect all reviews from orders
    const allReviews = orders
        .flatMap((order) =>
            order.reviews.map((review: any) => ({
                ...review,
                orderNumber: order.orderNumber,
                itemName: order.items.find(
                    (item: any) => item.menuItem?.id === review.menuItemId
                )?.menuItem?.name,
            }))
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (allReviews.length === 0) {
        return null;
    }

    return (
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
                    <span className="text-2xl">⭐</span>
                    Your Reviews
                </h2>
                <span className="text-xs font-bold text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                    {allReviews.length} Reviews
                </span>
            </div>

            <div className="space-y-4">
                {allReviews.slice(0, 5).map((review, i) => (
                    <div
                        key={i}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="font-bold text-white">{review.itemName}</p>
                                <p className="text-xs text-gray-400">
                                    From Order #{review.orderNumber}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={i < review.rating ? "text-yellow-400" : "text-gray-600"}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        {review.text && (
                            <p className="text-sm text-gray-300 italic">"{review.text}"</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>

            {allReviews.length > 5 && (
                <p className="text-xs text-gray-500 mt-4 text-center">
                    Showing 5 of {allReviews.length} reviews
                </p>
            )}
        </section>
    );
}
