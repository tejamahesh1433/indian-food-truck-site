import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
    plugins: [tsconfigPaths()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        fileParallelism: false,
        setupFiles: ["./vitest.setup.ts"],
        include: [
            "tests/unit/**/*.test.ts",
            "tests/unit/**/*.test.tsx",
            "tests/integration/**/*.test.ts",
            "tests/integration/**/*.test.tsx"
        ],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            reportsDirectory: "./coverage"
        }
    }
});
