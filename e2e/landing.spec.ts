import { expect, test } from "@playwright/test";

test("landing page keeps the pitch short and lets the product explain itself", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Read the point.Skip the rest.",
  );
  await expect(page.getByText("One private email. Every newsletter, distilled.")).toBeVisible();
  await expect(page.getByLabel("Your email")).toBeVisible();
  await expect(page.getByRole("link", { name: "Demo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A calmer reading loop." })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Less inbox, less data." })).toHaveCount(0);
});
