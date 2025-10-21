import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Increase timeout for blockchain tests
    testTimeout: 30000, // 30 seconds
    hookTimeout: 30000, // 30 seconds for setup/teardown
    teardownTimeout: 30000, // 30 seconds for cleanup
  },
});
