import { describe, expect, it } from "vitest";

import { createSessionValue, readSessionValue } from "@/lib/session";

describe("signed sessions", () => {
  it("round-trips a valid user id", async () => {
    const value = await createSessionValue("user_123", "test-secret");
    await expect(readSessionValue(value, "test-secret")).resolves.toBe(
      "user_123",
    );
  });

  it("rejects a changed payload", async () => {
    const value = await createSessionValue("user_123", "test-secret");
    await expect(
      readSessionValue(value.replace("user_123", "user_999"), "test-secret"),
    ).resolves.toBeNull();
  });
});
