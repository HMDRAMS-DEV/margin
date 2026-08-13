import { describe, expect, it } from "vitest";

import { findInboxSlug, parseNewsletterEmail } from "@/lib/inbound";

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

describe("parseNewsletterEmail", () => {
  it("identifies a publication by its article host instead of shared mail infrastructure", () => {
    const newsletter = parseNewsletterEmail({
      from: "Field Notes <fieldnotes@substack.com>",
      subject: "The shape of a week",
      text: null,
      html: `<a href="https://fieldnotes.substack.com/p/the-shape-of-a-week">Read</a><p>${"Useful article text. ".repeat(12)}</p>`,
    });

    expect(newsletter.publicationHostname).toBe("fieldnotes.substack.com");
  });
});
