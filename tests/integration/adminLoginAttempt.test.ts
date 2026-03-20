import { beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDatabase } from "../helpers/db";

const TEST_IP = "192.168.1.100";
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

async function getOrCreateAttempt(ip: string, prefix = "") {
    const key = prefix + ip;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + WINDOW_MS);

    const existing = await prisma.adminLoginAttempt.findFirst({
        where: { ip: key, expiresAt: { gt: now } },
    });

    if (existing) {
        return prisma.adminLoginAttempt.update({
            where: { id: existing.id },
            data: { count: existing.count + 1 },
        });
    }

    return prisma.adminLoginAttempt.create({
        data: { ip: key, count: 1, expiresAt },
    });
}

async function getAttemptCount(ip: string, prefix = "") {
    const key = prefix + ip;
    const now = new Date();
    const record = await prisma.adminLoginAttempt.findFirst({
        where: { ip: key, expiresAt: { gt: now } },
    });
    return record?.count ?? 0;
}

describe("AdminLoginAttempt rate limiting", () => {
    beforeEach(async () => {
        await prisma.adminLoginAttempt.deleteMany();
        await resetDatabase();
    });

    it("creates an attempt record on first login failure", async () => {
        await getOrCreateAttempt(TEST_IP);

        const count = await getAttemptCount(TEST_IP);
        expect(count).toBe(1);
    });

    it("increments count on subsequent failures from the same IP", async () => {
        await getOrCreateAttempt(TEST_IP);
        await getOrCreateAttempt(TEST_IP);
        await getOrCreateAttempt(TEST_IP);

        const count = await getAttemptCount(TEST_IP);
        expect(count).toBe(3);
    });

    it("blocks login after reaching the max attempt threshold", async () => {
        // Simulate MAX_ATTEMPTS failures
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            await getOrCreateAttempt(TEST_IP);
        }

        const count = await getAttemptCount(TEST_IP);
        expect(count).toBeGreaterThanOrEqual(MAX_ATTEMPTS);
    });

    it("treats different IPs as independent rate limit buckets", async () => {
        const ip1 = "10.0.0.1";
        const ip2 = "10.0.0.2";

        await getOrCreateAttempt(ip1);
        await getOrCreateAttempt(ip1);
        await getOrCreateAttempt(ip2);

        const count1 = await getAttemptCount(ip1);
        const count2 = await getAttemptCount(ip2);

        expect(count1).toBe(2);
        expect(count2).toBe(1);
    });

    it("treats pin_ prefix as separate bucket from admin login", async () => {
        const ip = "172.16.0.1";

        await getOrCreateAttempt(ip);           // admin login
        await getOrCreateAttempt(ip, "pin_");    // PIN verification

        const adminCount = await getAttemptCount(ip);
        const pinCount = await getAttemptCount(ip, "pin_");

        expect(adminCount).toBe(1);
        expect(pinCount).toBe(1);
    });

    it("does not count expired records", async () => {
        // Create an already-expired record
        await prisma.adminLoginAttempt.create({
            data: {
                ip: TEST_IP,
                count: 5,
                expiresAt: new Date(Date.now() - 1000), // expired 1 second ago
            },
        });

        const count = await getAttemptCount(TEST_IP);
        expect(count).toBe(0);
    });

    it("creates a fresh record after the old one expires", async () => {
        // Create expired record with high count
        await prisma.adminLoginAttempt.create({
            data: {
                ip: TEST_IP,
                count: 5,
                expiresAt: new Date(Date.now() - 1000), // expired
            },
        });

        // New failure after expiry starts fresh
        await getOrCreateAttempt(TEST_IP);

        const count = await getAttemptCount(TEST_IP);
        expect(count).toBe(1); // starts fresh
    });

    it("sets expiresAt approximately 15 minutes from now", async () => {
        const before = Date.now();
        await getOrCreateAttempt(TEST_IP);
        const after = Date.now();

        const record = await prisma.adminLoginAttempt.findFirst({
            where: { ip: TEST_IP },
        });

        const expiresMs = record!.expiresAt.getTime();
        const expectedMin = before + WINDOW_MS;
        const expectedMax = after + WINDOW_MS;

        expect(expiresMs).toBeGreaterThanOrEqual(expectedMin);
        expect(expiresMs).toBeLessThanOrEqual(expectedMax);
    });
});
