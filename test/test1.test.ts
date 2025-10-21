import { describe } from "vitest";
import { test } from "./setup";
import { function1 } from "src/utils";

describe("Test 1", () => {
  test("should run test 1", async ({ client }) => {
    function1();
  });
});
