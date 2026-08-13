import { convert } from "html-to-text";

import { findArticleUrl } from "@/lib/article-url";

export function findInboxSlug(
  recipients: string[],
  inboundDomain: string,
): string | null {
  const expectedDomain = inboundDomain.trim().toLowerCase();

  for (const recipient of recipients) {
    const match = recipient.match(/<?([^<>\s]+@[^<>\s]+)>?\s*$/);
    if (!match) continue;

    const [localPart, domain] = match[1].toLowerCase().split("@");
    if (localPart && domain === expectedDomain) return localPart;
  }

  return null;
}

export function extractArticleText(html: string | null, text: string | null): string {
  const body = html
    ? convert(html, {
        wordwrap: false,
        selectors: [
          { selector: "img", format: "skip" },
          { selector: "style", format: "skip" },
          { selector: "script", format: "skip" },
          { selector: "a", options: { ignoreHref: true } },
        ],
      })
    : (text ?? "");

  return body
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, 100_000);
}

export function parseNewsletterEmail(input: {
  html: string | null;
  text: string | null;
  subject: string;
  from: string;
}) {
  const senderMatch = input.from.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const senderAddress = (senderMatch?.[2] ?? input.from).trim().toLowerCase();
  const senderName = senderMatch?.[1].replace(/^"|"$/g, "").trim();
  const hostname = senderAddress.split("@")[1] ?? "unknown";
  const publicationName = senderName || hostname.split(".")[0] || "Newsletter";
  const sourceUrl = input.html ? findArticleUrl(input.html) : null;
  const publicationHostname = sourceUrl
    ? new URL(sourceUrl).hostname.toLowerCase()
    : senderAddress;

  return {
    title: input.subject.replace(/^\s*(re|fwd):\s*/i, "").trim(),
    author: senderName || null,
    publicationName,
    publicationHostname,
    sourceUrl,
    content: extractArticleText(input.html, input.text),
  };
}
