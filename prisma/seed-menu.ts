import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
    "Starters",
    "Mains",
    "Wraps",
    "Drinks",
    "Dessert",
];

const menuItems = [
    // Starters
    {
        id: "samosa",
        name: "Samosa",
        desc: "Crispy pastry stuffed with spiced potato and peas.",
        tags: ["Veg", "Popular"],
        category: "Starters",
        price: 4,
        image: "/images/menu/samosa.png",
    },
    {
        id: "pakora",
        name: "Onion Pakora",
        desc: "Crispy onion fritters with house chutneys.",
        tags: ["Veg"],
        category: "Starters",
        price: 6,
        image: "/images/menu/pakora.png",
    },
    {
        id: "samosa-chaat",
        name: "Samosa Chaat",
        desc: "Samosa topped with yogurt, chutneys, masala crunch.",
        tags: ["Veg", "Popular"],
        category: "Starters",
        price: 8,
        image: "/images/menu/samosa-chaat.png",
    },

    // Mains
    {
        id: "butter-chicken",
        name: "Butter Chicken",
        desc: "Creamy tomato curry finished with butter and spice.",
        tags: ["Popular"],
        category: "Mains",
        price: 14,
        image: "/images/menu/butter-chicken.png",
    },
    {
        id: "chana-masala",
        name: "Chana Masala",
        desc: "Chickpea curry with bold spices, served hot.",
        tags: ["Veg"],
        category: "Mains",
        price: 12,
        image: "/images/menu/chana-masala.png",
    },
    {
        id: "chicken-tikka",
        name: "Chicken Tikka",
        desc: "Smoky grilled chicken with spice and char.",
        tags: ["Spicy"],
        category: "Mains",
        price: 13,
        image: "/images/menu/chicken-tikka.png",
    },

    // Wraps
    {
        id: "paneer-wrap",
        name: "Paneer Tikka Wrap",
        desc: "Charred paneer, mint sauce, onions, warm wrap.",
        tags: ["Veg", "Popular"],
        category: "Wraps",
        price: 12,
        image: "/images/menu/paneer-wrap.png",
    },
    {
        id: "tikka-roll",
        name: "Chicken Tikka Roll",
        desc: "Street-style roll with tikka, chutney, and crunch.",
        tags: ["Spicy", "Popular"],
        category: "Wraps",
        price: 12,
        image: "/images/menu/tikka-roll.png",
    },

    // Drinks
    {
        id: "mango-lassi",
        name: "Mango Lassi",
        desc: "Thick chilled mango yogurt drink.",
        tags: ["Popular"],
        category: "Drinks",
        price: 6,
        image: "/images/menu/mango-lassi.png",
    },
    {
        id: "masala-chai",
        name: "Masala Chai",
        desc: "Hot spiced tea, classic street-side style.",
        tags: [],
        category: "Drinks",
        price: 4,
        image: "/images/menu/masala-chai.png",
    },

    // Dessert
    {
        id: "gulab-jamun",
        name: "Gulab Jamun",
        desc: "Soft milk dumplings soaked in rose-cardamom syrup.",
        tags: ["Veg"],
        category: "Dessert",
        price: 6,
        image: "/images/menu/gulab-jamun.png",
    },
    {
        id: "lamb-rogan-josh",
        name: "Lamb Rogan Josh",
        desc: "Tender lamb in a rich, aromatic ginger and garlic sauce.",
        tags: ["Spicy"],
        category: "Mains",
        price: 16,
        image: "/images/menu/lamb-rogan.png",
    },
    {
        id: "paneer-butter-masala",
        name: "Paneer Butter Masala",
        desc: "Cottage cheese cubes in a creamy, velvety tomato sauce.",
        tags: ["Veg", "Popular"],
        category: "Mains",
        price: 13,
        image: "/images/menu/paneer-butter.png",
    },
    {
        id: "chicken-biryani",
        name: "Hyderabadi Chicken Biryani",
        desc: "Fragrant basmati rice layered with spiced chicken and herbs.",
        tags: ["Spicy", "Popular"],
        category: "Mains",
        price: 15,
        image: "/images/menu/chicken-biryani.png",
    },
    {
        id: "tandoori-chicken",
        name: "Tandoori Chicken (Half)",
        desc: "Yogurt-marinated chicken grilled to perfection in the clay oven.",
        tags: ["Popular"],
        category: "Mains",
        price: 12,
        image: "/images/menu/tandoori-chicken.png",
    },
    {
        id: "lamb-kebab-roll",
        name: "Lamb Kebab Roll",
        desc: "Spiced minced lamb skewers wrapped in a soft paratha.",
        tags: ["Spicy"],
        category: "Wraps",
        price: 13,
        image: "/images/menu/lamb-roll.png",
    },
    {
        id: "nimbu-pani",
        name: "Nimbu Pani",
        desc: "Refreshing Indian-style lemonade with black salt and cumin.",
        tags: ["Veg"],
        category: "Drinks",
        price: 5,
        image: "/images/menu/nimbu-pani.png",
    },
    {
        id: "rasmalai",
        name: "Rasmalai",
        desc: "Soft cottage cheese discs soaked in sweetened saffron milk.",
        tags: ["Veg", "Popular"],
        category: "Dessert",
        price: 7,
        image: "/images/menu/rasmalai.png",
    },
];

async function main() {
    console.log("Starting menu seeding...");

    // Seed Categories
    for (let i = 0; i < categories.length; i++) {
        await prisma.menuCategory.upsert({
            where: { name: categories[i] },
            update: { sortOrder: i },
            create: { name: categories[i], sortOrder: i },
        });
    }
    console.log(`Seeded ${categories.length} categories.`);

    // Seed Items
    for (let i = 0; i < menuItems.length; i++) {
        const item = menuItems[i];
        await prisma.menuItem.upsert({
            where: { id: item.id },
            update: {
                name: item.name,
                description: item.desc,
                priceCents: Math.round(item.price * 100),
                imageUrl: item.image,
                category: item.category,
                isVeg: item.tags.includes("Veg"),
                isSpicy: item.tags.includes("Spicy"),
                isPopular: item.tags.includes("Popular"),
                sortOrder: i,
            },
            create: {
                id: item.id,
                name: item.name,
                description: item.desc,
                priceCents: Math.round(item.price * 100),
                imageUrl: item.image,
                category: item.category,
                isVeg: item.tags.includes("Veg"),
                isSpicy: item.tags.includes("Spicy"),
                isPopular: item.tags.includes("Popular"),
                sortOrder: i,
            },
        });
    }
    console.log(`Seeded ${menuItems.length} menu items.`);

    console.log("Menu seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
