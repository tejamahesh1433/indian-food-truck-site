import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setAdminPassword() {
    const password = process.argv[2];

    if (!password) {
        console.error("Usage: node scripts/set-admin-password.mjs 'YOUR_NEW_PASSWORD'");
        process.exit(1);
    }

    console.log("----------------------------------------");
    console.log("🛠️  Updating Admin Password...");

    try {
        // 1. Generate Hash
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // 2. Base64 Encode (to protect against env truncation)
        const shieldedHash = Buffer.from(hash).toString("base64");

        // 3. Update .env file
        const envPath = path.join(process.cwd(), ".env");
        let envContent = fs.readFileSync(envPath, "utf-8");

        const envKey = "NEXT_PUBLIC_ADMIN_AUTH_HASH";
        const newEntry = `${envKey}='${shieldedHash}'`;

        if (envContent.includes(envKey)) {
            envContent = envContent.replace(
                new RegExp(`${envKey}=['"]?.*?['"]?(\n|$)`, "g"),
                `${newEntry}\n`
            );
        } else {
            envContent += `\n${newEntry}\n`;
        }

        fs.writeFileSync(envPath, envContent);

        console.log("✅ Success! Your .env file has been updated.");
        console.log(`🔒 New Password is now active: ${password}`);
        console.log("----------------------------------------");
        console.log("Please restart your server (npm run dev) to apply the changes.");
        console.log("----------------------------------------");

    } catch (error) {
        console.error("❌ Failed to update password:", error);
    }
}

setAdminPassword();
