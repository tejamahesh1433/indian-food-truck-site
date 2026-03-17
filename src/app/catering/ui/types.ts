export type Badge = "VEG" | "SPICY" | "POPULAR" | "NUTS";

export type Price =
    | { kind: "PER_PERSON"; amount: number; minPeople?: number }
    | { kind: "TRAY"; half?: number; full?: number }
    | { kind: "FIXED"; amount: number; unit?: string };

export type CateringItem = {
    id: string;
    name: string;
    description?: string;
    badges?: Badge[];
    price: Price;
};

export type CateringSection = {
    title: string;
    subtitle?: string;
    items: CateringItem[];
};

export type SelectedItem = {
    id: string;
    internalId: string; // unique for each selection instance
    name: string;
    quantity: number;
    options: {
        [key: string]: string | number;
    };
    priceLabel: string;
    pricePerUnit: number;
};
