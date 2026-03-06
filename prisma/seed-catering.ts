import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding catering categories...");

    const categories = [
        { name: "Packages", subtitle: "Per-person bundles for offices, birthdays, campus events", sortOrder: 1 },
        { name: "Curries", subtitle: "Half trays and full trays. Spice level: Mild / Medium / Hot", sortOrder: 2 },
        { name: "Rice & Biryani", subtitle: "Great pairing for curries and trays", sortOrder: 3 },
        { name: "Bread", subtitle: "Fresh-baked breads (tray pricing)", sortOrder: 4 },
        { name: "Appetizers", subtitle: "Perfect starters for events", sortOrder: 5 },
        { name: "Add-ons", subtitle: "Drinks and extras", sortOrder: 6 },
        { name: "Desserts", subtitle: "Sweet finish for your event", sortOrder: 7 },
    ];

    for (const cat of categories) {
        await prisma.cateringCategory.upsert({
            where: { name: cat.name },
            update: cat,
            create: cat,
        });
    }

    console.log("Seeding catering items...");

    const items = [
        // Packages
        { name: "Street Food Lunch Package", category: "Packages", priceKind: "PER_PERSON", amount: 14, minPeople: 20, isPopular: true, description: "Choose 2 mains + rice + salad + chutneys." },
        { name: "Classic Curry Package", category: "Packages", priceKind: "PER_PERSON", amount: 16, minPeople: 25, isPopular: true, description: "2 curries + rice + naan + salad." },
        { name: "Corporate Dinner Package", category: "Packages", priceKind: "PER_PERSON", amount: 18, minPeople: 25, isPopular: true, description: "2 curries + biryani + naan + dessert." },
        { name: "Premium Feast Package", category: "Packages", priceKind: "PER_PERSON", amount: 19, minPeople: 30, isPopular: true, description: "3 curries + rice + naan + appetizer + dessert." },
        { name: "Campus Event Package", category: "Packages", priceKind: "PER_PERSON", amount: 15, minPeople: 30, isPopular: true, description: "Wraps + samosas + rice + chutneys." },
        { name: "Wedding Reception Package", category: "Packages", priceKind: "PER_PERSON", amount: 22, minPeople: 50, isPopular: true, description: "3 curries + biryani + naan + appetizers + dessert." },

        // Curries
        { name: "Chicken Tikka Masala", category: "Curries", priceKind: "TRAY", halfPrice: 65, fullPrice: 110, isPopular: true, description: "Creamy tomato sauce, grilled chicken." },
        { name: "Butter Chicken", category: "Curries", priceKind: "TRAY", halfPrice: 65, fullPrice: 110, isPopular: true, description: "Rich buttery tomato gravy, tender chicken." },
        { name: "Chicken Curry", category: "Curries", priceKind: "TRAY", halfPrice: 60, fullPrice: 105, description: "Classic spiced curry sauce." },
        { name: "Chicken Korma", category: "Curries", priceKind: "TRAY", halfPrice: 65, fullPrice: 110, description: "Mild creamy curry with warm spices." },
        { name: "Lamb Curry", category: "Curries", priceKind: "TRAY", halfPrice: 75, fullPrice: 130, description: "Slow-cooked lamb in aromatic spices." },
        { name: "Lamb Vindaloo", category: "Curries", priceKind: "TRAY", halfPrice: 75, fullPrice: 130, isSpicy: true, description: "Spicy tangy curry (can be mild on request)." },
        { name: "Butter Paneer", category: "Curries", priceKind: "TRAY", halfPrice: 60, fullPrice: 100, isVeg: true, isPopular: true, description: "Rich and creamy paneer curry." },
        { name: "Palak Paneer", category: "Curries", priceKind: "TRAY", halfPrice: 60, fullPrice: 100, isVeg: true, description: "Paneer in spiced spinach gravy." },
        { name: "Chana Masala", category: "Curries", priceKind: "TRAY", halfPrice: 55, fullPrice: 90, isVeg: true, description: "Chickpeas simmered with spices." },
        { name: "Dal Tadka", category: "Curries", priceKind: "TRAY", halfPrice: 50, fullPrice: 85, isVeg: true, description: "Yellow lentils tempered with cumin and garlic." },
        { name: "Mixed Vegetable Curry", category: "Curries", priceKind: "TRAY", halfPrice: 55, fullPrice: 90, isVeg: true, description: "Seasonal veggies in a flavorful curry." },

        // Rice & Biryani
        { name: "Chicken Biryani", category: "Rice & Biryani", priceKind: "TRAY", halfPrice: 70, fullPrice: 120, isPopular: true, description: "Fragrant basmati rice cooked with spiced chicken." },
        { name: "Vegetable Biryani", category: "Rice & Biryani", priceKind: "TRAY", halfPrice: 60, fullPrice: 105, isVeg: true, description: "Mixed vegetables cooked with aromatic basmati rice." },
        { name: "Basmati Rice", category: "Rice & Biryani", priceKind: "TRAY", halfPrice: 35, fullPrice: 55, isVeg: true, description: "Plain basmati rice." },
        { name: "Jeera Rice", category: "Rice & Biryani", priceKind: "TRAY", halfPrice: 38, fullPrice: 60, isVeg: true, description: "Cumin-spiced basmati rice." },

        // Bread
        { name: "Plain Naan", category: "Bread", priceKind: "TRAY", halfPrice: 40, fullPrice: 65, isVeg: true, description: "Soft classic naan." },
        { name: "Butter Naan", category: "Bread", priceKind: "TRAY", halfPrice: 42, fullPrice: 68, isVeg: true, description: "Brushed with butter." },
        { name: "Garlic Naan", category: "Bread", priceKind: "TRAY", halfPrice: 45, fullPrice: 72, isVeg: true, isPopular: true, description: "Garlic + herbs." },

        // Appetizers
        { name: "Samosa Platter (20 pcs)", category: "Appetizers", priceKind: "FIXED", amount: 40, unit: "platter", isVeg: true, isPopular: true, description: "Crispy potato samosas with chutneys." },
        { name: "Vegetable Pakora", category: "Appetizers", priceKind: "FIXED", amount: 45, unit: "tray", isVeg: true, description: "Crispy fritters with chutneys." },
        { name: "Chicken Pakora", category: "Appetizers", priceKind: "FIXED", amount: 55, unit: "tray", description: "Crispy spiced chicken bites." },
        { name: "Paneer Tikka", category: "Appetizers", priceKind: "FIXED", amount: 60, unit: "tray", isVeg: true, isPopular: true, description: "Grilled paneer with spices and peppers." },

        // Add-ons
        { name: "Masala Chai (Gallon)", category: "Add-ons", priceKind: "FIXED", amount: 22, unit: "gallon", isPopular: true, description: "Spiced milk tea. Great for cold days." },
        { name: "Mango Lassi (Gallon)", category: "Add-ons", priceKind: "FIXED", amount: 30, unit: "gallon", isVeg: true, isPopular: true, description: "Sweet mango yogurt drink." },
        { name: "Chutney Trio", category: "Add-ons", priceKind: "FIXED", amount: 12, unit: "set", isVeg: true, description: "Mint, tamarind, and spicy chili chutneys." },
        { name: "Raita", category: "Add-ons", priceKind: "FIXED", amount: 15, unit: "container", isVeg: true, description: "Cooling yogurt sauce." },

        // Desserts
        { name: "Gulab Jamun (20 pcs)", category: "Desserts", priceKind: "FIXED", amount: 45, unit: "tray", isVeg: true, isPopular: true, description: "Classic Indian dessert." },
        { name: "Kheer (Rice Pudding)", category: "Desserts", priceKind: "FIXED", amount: 50, unit: "tray", isVeg: true, description: "Creamy rice pudding with cardamom." },
        { name: "Rasmalai (20 pcs)", category: "Desserts", priceKind: "FIXED", amount: 55, unit: "tray", isVeg: true, description: "Soft cheese patties in sweet milk." },
    ];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await prisma.cateringItem.create({
            data: {
                ...item,
                sortOrder: i,
            }
        });
    }

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
