import { describe, expect, it } from "vitest";

import { findInboxSlug } from "@/lib/inbound";

describe("findInboxSlug", () => {
  it("finds the account slug in formatted recipient fields", () => {
    expect(
      findInboxSlug(
        ["Margin <quiet-river-42@in.margin.test>"],
        "in.margin.test",
      ),
    ).toBe("quiet-river-42");
  });

  it("ignores recipients on other domains", () => {
    expect(findInboxSlug(["reader@example.com"], "in.margin.test")).toBeNull();
  });
});
