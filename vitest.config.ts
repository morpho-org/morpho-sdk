import { config } from "dotenv";
import { defineConfig } from "vitest/config";

config();

export default defineConfig({
  test: {
    coverage: {
      reporter: process.env.CI ? ["lcov"] : ["text", "json", "html"],
      exclude: ["vitest.*.ts", "**/lib/**", "**/dist/**", "**/artifacts/**"],
    },
    sequence: {
      concurrent: true,
    },
    globalSetup: "vitest.setup.ts",
    retry: process.env.CI ? 2 : 0,
    testTimeout: 30_000,
  },
});
