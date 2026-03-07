export type Price =
    | { kind: "PER_PERSON"; amount: number; minPeople?: number }
    | { kind: "TRAY"; half?: number; full?: number }
    | { kind: "FIXED"; amount: number; unit?: string };

export function money(n: number) {
    return `$${n.toFixed(0)}`;
}

export function priceLabel(p: Price, options?: { selectedSize?: string }) {
    if (p.kind === "PER_PERSON") {
        const min = p.minPeople ? ` • ${p.minPeople} person min` : "";
        return `${money(p.amount)}/person${min}`;
    }

    if (p.kind === "TRAY") {
        if (options?.selectedSize === "Half Tray" && typeof p.half === "number") {
            return `${money(p.half)} (Half Tray)`;
        }
        if (options?.selectedSize === "Full Tray" && typeof p.full === "number") {
            return `${money(p.full)} (Full Tray)`;
        }
        const half = typeof p.half === "number" ? `Half ${money(p.half)}` : "";
        const full = typeof p.full === "number" ? `Full ${money(p.full)}` : "";
        return [half, full].filter(Boolean).join(" • ");
    }

    const unit = p.unit ? `/${p.unit}` : "";
    return `${money(p.amount)}${unit}`;
}
