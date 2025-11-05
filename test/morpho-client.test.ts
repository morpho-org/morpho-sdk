import { describe, expect } from "vitest";
import { createMorphoClient } from "../src/client";
import { test } from "./setup";

describe("MorphoClient", () => {
  test("should create a morpho client", ({ client }) => {
    const morpho = createMorphoClient(client);

    expect(morpho).toBeDefined();
    expect(morpho.walletClient).toBeDefined();
    expect(morpho.vaultV2).toBeDefined();
    expect(typeof morpho.vaultV2).toBe("function");
  });
});
