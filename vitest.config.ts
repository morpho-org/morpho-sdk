import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    sequence: {
      concurrent: true,
    },
    globalSetup: "vitest.setup.ts",
    retry: process.env.CI ? 2 : 0,
    testTimeout: 30_000,
  },
});
