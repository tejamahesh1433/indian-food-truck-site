import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                menuItem: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                },
                reviews: {
                    include: {
                        menuItem: {
                            select: { name: true }
                        }
                    }
                },
                favorites: {
                    include: {
                        menuItem: {
                            select: { name: true, category: true }
                        }
                    }
                },
                savedLocations: true,
                accounts: {
                    select: {
                        provider: true,
                        type: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Clean up data for export (remove internal IDs if desired, but for portability IDs can be useful)
        // Here we'll just remove sensitive fields like 'password'
        const exportData = {
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                emailVerified: user.emailVerified,
                preferences: {
                    emailNotifications: user.emailNotifications,
                    marketingEmails: user.marketingEmails
                }
            },
            accounts: user.accounts,
            orders: user.orders.map(order => ({
                id: order.id,
                status: order.status,
                createdAt: order.createdAt,
                subtotal: order.subtotalAmount / 100,
                tax: order.taxAmount / 100,
                total: order.totalAmount / 100,
                items: order.items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.priceCents / 100,
                    notes: item.notes
                }))
            })),
            reviews: user.reviews.map(review => ({
                item: review.menuItem?.name || "Deleted Item",
                rating: review.rating,
                text: review.text,
                createdAt: review.createdAt
            })),
            favorites: user.favorites.map(fav => ({
                item: fav.menuItem.name,
                category: fav.menuItem.category,
                addedAt: fav.createdAt
            })),
            savedLocations: user.savedLocations.map(loc => ({
                name: loc.name,
                address: loc.address,
                createdAt: loc.createdAt
            })),
            exportDate: new Date().toISOString()
        };

        return NextResponse.json(exportData);
    } catch (error: unknown) {
        console.error("DATA_EXPORT_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
