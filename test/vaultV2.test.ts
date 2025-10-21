import { describe, expect, test } from "vitest";
import { depositVaultV2 } from "src";

describe("VaultV2", () => {
  test("should deposit", async () => {
    const depositTx = depositVaultV2({
      chainId: 1,
      asset: "0x0000000000000000000000000000000000000000",
      amount: 100n,
      recipient: "0x0000000000000000000000000000000000000000",
      vault: "0x0000000000000000000000000000000000000000",
    });

    expect(depositTx).toBeDefined();
  });
});
