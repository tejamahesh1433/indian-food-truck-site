export function normalizePhone(phone: string) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) {
        return `+${digits}`;
    }
    if (digits.length === 10) {
        return `+1${digits}`;
    }
    return phone.startsWith("+") ? phone : `+${digits}`;
}
