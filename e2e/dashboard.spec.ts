import { expect, test } from "@playwright/test";

test("a reader can progressively expand an article", async ({ page }) => {
  await page.goto("/demo");

  const article = page.getByRole("article").first();
  await expect(article.getByTestId("one-sentence")).toBeVisible();
  await expect(article.getByTestId("three-points")).toBeHidden();

  await article.getByRole("button", { name: "Show three key points" }).click();
  await expect(article.getByTestId("three-points")).toBeVisible();

  await article.getByRole("button", { name: "Show ten details" }).click();
  await expect(article.getByTestId("ten-points")).toBeVisible();
  await expect(article.getByRole("link", { name: "Read full article" })).toBeVisible();
});
