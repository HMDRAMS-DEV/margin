import { describe, expect, it } from "vitest";

import {
  canonicalizeArticleUrl,
  findArticleUrl,
} from "@/lib/article-url";

describe("canonicalizeArticleUrl", () => {
  it("removes Substack tracking parameters and fragments", () => {
    expect(
      canonicalizeArticleUrl(
        "https://example.substack.com/p/the-point?utm_source=post-email-title&publication_id=123#details",
      ),
    ).toBe("https://example.substack.com/p/the-point");
  });

  it("keeps meaningful query parameters on non-Substack links", () => {
    expect(canonicalizeArticleUrl("https://example.com/read?id=42&utm_source=email"))
      .toBe("https://example.com/read?id=42");
  });
});

describe("findArticleUrl", () => {
  it("prefers the canonical /p/ article over account and unsubscribe links", () => {
    const html = `
      <a href="https://example.substack.com/account">Account</a>
      <a href="https://example.substack.com/p/the-point?utm_source=post-email-title">The point</a>
      <a href="https://example.substack.com/action/disable_email">Unsubscribe</a>
    `;

    expect(findArticleUrl(html)).toBe(
      "https://example.substack.com/p/the-point",
    );
  });
});
