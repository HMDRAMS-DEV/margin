import { expect, test } from "@playwright/test";

test("landing page explains the progressive reading model", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Read the point",
  );
  await expect(page.getByLabel("Your email")).toBeVisible();
  await expect(page.getByRole("link", { name: "Try the demo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View source" })).toBeVisible();
});
