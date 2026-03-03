import jwt from "jsonwebtoken";

const COOKIE_NAME = "admin_token";

export function signAdminToken() {
    return jwt.sign({ role: "admin" }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
}

export function getAdminCookieName() {
    return COOKIE_NAME;
}
