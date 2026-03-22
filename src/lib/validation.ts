/**
 * List of well-recognized/popular email domains.
 * Restricting to these prevents spam and ensures high-quality data.
 */
export const ALLOWED_EMAIL_DOMAINS = [
    "gmail.com",
    "googlemail.com",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "msn.com",
    "yahoo.com",
    "ymail.com",
    "icloud.com",
    "me.com",
    "aol.com",
    "protonmail.com",
    "proton.me"
];

/**
 * Validates if an email address belongs to a well-recognized domain.
 */
export function isWellRecognizedEmail(email: string): boolean {
    if (!email || !email.includes("@")) return false;
    
    const domain = email.split("@").pop()?.toLowerCase();
    if (!domain) return false;
    
    return ALLOWED_EMAIL_DOMAINS.includes(domain);
}

/**
 * Returns a user-friendly error message if the email is not recognized.
 */
export const EMAIL_DOMAIN_ERROR = "Please use a well-recognized email provider (e.g., @gmail.com, @hotmail.com).";
