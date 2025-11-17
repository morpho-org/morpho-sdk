import { describe, expect } from "vitest";
import { morpho } from "../src/client";
import { test } from "./setup";

describe("Morpho viem extension", () => {
  test("should extend viem client with morpho namespace", ({ client }) => {
    const extendedClient = client.extend(morpho());

    expect(extendedClient).toBeDefined();
    expect(extendedClient.morpho).toBeDefined();
    expect(extendedClient.morpho.vaultV2).toBeDefined();
    expect(typeof extendedClient.morpho.vaultV2).toBe("function");
  });

  test("should allow accessing vaultV2 through morpho namespace", ({
    client,
  }) => {
    const extendedClient = client.extend(morpho());

    const vault = extendedClient.morpho.vaultV2(
      "0x04422053aDDbc9bB2759b248B574e3FCA76Bc145"
    );

    expect(vault).toBeDefined();
    expect(vault.getData).toBeDefined();
    expect(vault.deposit).toBeDefined();
    expect(vault.withdraw).toBeDefined();
    expect(vault.redeem).toBeDefined();
  });

  test("should accept metadata parameter", ({ client }) => {
    const metadata = { origin: "test" };
    const extendedClient = client.extend(morpho(metadata));

    expect(extendedClient.morpho).toBeDefined();
    expect(extendedClient.morpho.vaultV2).toBeDefined();
  });
});
