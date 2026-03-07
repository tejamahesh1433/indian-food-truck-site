export type SelectedMenuItem = {
    id: string;
    name: string;
    quantity: number;
    selectedOptions: Record<string, string | number>;
};

export function buildRequestNotes(items: SelectedMenuItem[]) {
    if (!items.length) return "";

    return [
        "Selected Catering Items:",
        ...items.map((item, index) => {
            const optionText = Object.entries(item.selectedOptions)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" | ");

            return `${index + 1}. ${item.name} — ${optionText} — Qty ${item.quantity}`;
        })
    ].join("\n");
}
