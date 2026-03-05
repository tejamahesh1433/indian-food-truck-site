import crypto from "crypto";

export function makeChatToken() {
    // 32 bytes -> 43 chars base64url-ish; strong + unguessable
    return crypto.randomBytes(32).toString("base64url");
}
