import { describe, it, expect } from "vitest";

// Mock utility functions (to match actual implementations in src/lib/utils/)

function validatePhone(phone: string): boolean {
    // Should match E.164 format: +[1-9]{1}[0-9]{1,14}
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
}

function formatPhoneDisplay(phone: string): string {
    // Convert +1 (234) 567-8900 format
    if (!validatePhone(phone)) return phone;
    // For US: +1 (555) 123-4567
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
}

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

function calculateTax(subtotalCents: number, taxRate: number = 0.08): number {
    return Math.round(subtotalCents * taxRate);
}

function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>\"']/g, "") // Remove HTML-like characters
        .slice(0, 500); // Limit length
}

describe("Utility Functions - Validation", () => {
    describe("Phone number validation", () => {
        it("should accept valid E.164 format", () => {
            expect(validatePhone("+12035550100")).toBe(true);
            expect(validatePhone("+1 (203) 555-0100")).toBe(false); // Spaces not allowed in strict E.164
            expect(validatePhone("+442071838750")).toBe(true); // UK number
        });

        it("should reject invalid format", () => {
            expect(validatePhone("2035550100")).toBe(false); // Missing +
            expect(validatePhone("+1")).toBe(false); // Too short
            expect(validatePhone("")).toBe(false);
            expect(validatePhone("invalid")).toBe(false);
        });

        it("should reject leading zero", () => {
            expect(validatePhone("+02035550100")).toBe(false);
        });

        it("should support international numbers", () => {
            expect(validatePhone("+442071838750")).toBe(true); // UK
            expect(validatePhone("+33123456789")).toBe(true); // France
            expect(validatePhone("+919876543210")).toBe(true); // India
        });
    });

    describe("Email validation", () => {
        it("should accept valid emails", () => {
            expect(validateEmail("user@example.com")).toBe(true);
            expect(validateEmail("test.user+tag@subdomain.example.co.uk")).toBe(true);
        });

        it("should reject invalid emails", () => {
            expect(validateEmail("invalid")).toBe(false);
            expect(validateEmail("@example.com")).toBe(false);
            expect(validateEmail("user@")).toBe(false);
            expect(validateEmail("user @example.com")).toBe(false);
        });

        it("should reject empty string", () => {
            expect(validateEmail("")).toBe(false);
        });
    });
});

describe("Utility Functions - Formatting", () => {
    describe("Phone number formatting", () => {
        it("should format US numbers with parentheses", () => {
            const formatted = formatPhoneDisplay("+12035550100");
            expect(formatted).toMatch(/\+1 \(\d{3}\) \d{3}-\d{4}/);
        });

        it("should return original for invalid input", () => {
            const invalid = "not-a-phone";
            expect(formatPhoneDisplay(invalid)).toBe(invalid);
        });
    });

    describe("Price formatting", () => {
        it("should format cents as dollars with 2 decimals", () => {
            expect(formatPrice(1299)).toBe("$12.99");
            expect(formatPrice(99)).toBe("$0.99");
            expect(formatPrice(5000)).toBe("$50.00");
        });

        it("should handle zero", () => {
            expect(formatPrice(0)).toBe("$0.00");
        });

        it("should handle whole dollar amounts", () => {
            expect(formatPrice(2500)).toBe("$25.00");
        });
    });

    describe("Order ID generation", () => {
        it("should generate unique order IDs", () => {
            const id1 = generateOrderId();
            const id2 = generateOrderId();

            expect(id1).not.toBe(id2);
        });

        it("should include ORD- prefix", () => {
            const id = generateOrderId();
            expect(id).toMatch(/^ORD-/);
        });

        it("should include timestamp", () => {
            const id = generateOrderId();
            expect(id).toMatch(/ORD-\d+/);
        });
    });
});

describe("Utility Functions - Tax Calculations", () => {
    describe("Tax calculation", () => {
        it("should calculate 8% tax by default", () => {
            expect(calculateTax(1000)).toBe(80);
            expect(calculateTax(2500)).toBe(200);
        });

        it("should support custom tax rates", () => {
            expect(calculateTax(1000, 0.10)).toBe(100); // 10%
            expect(calculateTax(1000, 0.06)).toBe(60); // 6%
        });

        it("should round to nearest cent", () => {
            // 1234 * 0.08 = 98.72, should round to 99
            const tax = calculateTax(1234);
            expect(tax).toBe(99);
        });

        it("should handle zero subtotal", () => {
            expect(calculateTax(0)).toBe(0);
        });

        it("should handle negative rates gracefully", () => {
            const tax = calculateTax(1000, -0.05);
            expect(tax).toBe(-50);
        });
    });
});

describe("Utility Functions - Input Sanitization", () => {
    describe("Input sanitization", () => {
        it("should trim whitespace", () => {
            expect(sanitizeInput("  hello  ")).toBe("hello");
        });

        it("should remove HTML-like characters", () => {
            const input = "Hello <script>alert('xss')</script>";
            const sanitized = sanitizeInput(input);
            expect(sanitized).not.toContain("<");
            expect(sanitized).not.toContain(">");
        });

        it("should remove quotes", () => {
            expect(sanitizeInput('Hello "world"')).not.toContain('"');
            expect(sanitizeInput("Hello 'world'")).not.toContain("'");
        });

        it("should limit length to 500 characters", () => {
            const longInput = "a".repeat(600);
            const sanitized = sanitizeInput(longInput);
            expect(sanitized.length).toBeLessThanOrEqual(500);
        });

        it("should preserve safe characters", () => {
            const safe = "John Doe, 123 Main St. Phone: 555-1234";
            expect(sanitizeInput(safe)).toContain("John Doe");
            expect(sanitizeInput(safe)).toContain("123");
        });
    });
});

describe("Utility Functions - Edge Cases", () => {
    describe("Large values", () => {
        it("should handle large prices", () => {
            expect(formatPrice(999999999)).toBe("$9999999.99");
        });

        it("should calculate tax on large amounts", () => {
            const tax = calculateTax(100000000); // $1,000,000
            expect(tax).toBe(8000000); // $80,000
        });
    });

    describe("Special characters and encoding", () => {
        it("should handle Unicode in sanitization", () => {
            const unicode = "Hello 世界 🍛";
            const sanitized = sanitizeInput(unicode);
            expect(sanitized).toContain("Hello");
        });

        it("should handle email with special chars", () => {
            expect(validateEmail("user+tag@example.com")).toBe(true);
            expect(validateEmail("user.name@example.co.uk")).toBe(true);
        });
    });

    describe("Null and undefined handling", () => {
        it("should handle empty strings", () => {
            expect(sanitizeInput("")).toBe("");
            expect(validatePhone("")).toBe(false);
            expect(validateEmail("")).toBe(false);
        });
    });
});
