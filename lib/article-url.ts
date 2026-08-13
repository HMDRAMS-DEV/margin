import * as cheerio from "cheerio";

const TRACKING_PARAMETERS = new Set([
  "utm_campaign",
  "utm_content",
  "utm_medium",
  "utm_source",
  "utm_term",
  "publication_id",
  "post_id",
  "r",
  "triedRedirect",
]);

export function canonicalizeArticleUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    url.hash = "";
    for (const key of Array.from(url.searchParams.keys())) {
      if (key.startsWith("utm_") || TRACKING_PARAMETERS.has(key)) {
        url.searchParams.delete(key);
      }
    }

    if (url.hostname.endsWith("substack.com") && url.pathname.includes("/p/")) {
      url.search = "";
    }

    if (url.pathname !== "/") {
      url.pathname = url.pathname.replace(/\/$/, "");
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function findArticleUrl(html: string): string | null {
  const $ = cheerio.load(html);
  const candidates = $("a[href]")
    .toArray()
    .map((element) => canonicalizeArticleUrl($(element).attr("href") ?? ""))
    .filter((url): url is string => Boolean(url));

  return (
    candidates.find((url) => {
      const parsed = new URL(url);
      return parsed.pathname.includes("/p/");
    }) ?? null
  );
}
