export type MenuTag = "Veg" | "Spicy" | "Popular" | "New";

export type MenuItem = {
    id: string;
    name: string;
    desc: string;
    price?: number;
    tags?: MenuTag[];
    category: "Starters" | "Mains" | "Wraps" | "Drinks" | "Dessert";
    image: string;
};

export const categories: MenuItem["category"][] = [
    "Starters",
    "Mains",
    "Wraps",
    "Drinks",
    "Dessert",
];

export const menuItems: MenuItem[] = [
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
];
