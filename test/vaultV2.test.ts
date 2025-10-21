import { describe, test } from "vitest";
import { deposit } from "src";

describe("VaultV2", () => {
  test("should deposit", async () => {
    const depositTx = await deposit({
      chainId: 1,
      asset: "0x0000000000000000000000000000000000000000",
      amount: 100n,
      recipient: "0x0000000000000000000000000000000000000000",
      vault: "0x0000000000000000000000000000000000000000",
    });

    console.log(depositTx);
  });
});
