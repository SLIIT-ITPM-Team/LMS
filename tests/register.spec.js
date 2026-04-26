import { test, expect } from "@playwright/test";

test("register page loads", async ({ page }) => {
  await page.goto("/register");

  await expect(page).toHaveURL(/\/register/);
  await expect(page.locator("#name")).toBeVisible();
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
  await expect(page.locator("#confirmPassword")).toBeVisible();
  await expect(page.locator("#department")).toBeVisible();
  await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
});

test("register validation shows required field errors", async ({ page }) => {
  await page.goto("/register");

  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page.getByText("Name is required")).toBeVisible();
  await expect(page.getByText("Email is required")).toBeVisible();
  await expect(page.getByText("Password is required")).toBeVisible();
  await expect(page.getByText("Please confirm your password")).toBeVisible();
  await expect(page.getByText("Please select a department")).toBeVisible();
  await expect(page.getByText("You must accept terms and conditions")).toBeVisible();
});

test("register validation blocks password mismatch", async ({ page }) => {
  await page.goto("/register");

  await page.locator("#name").fill("Student User");
  await page.locator("#email").fill("student@example.com");
  await page.locator("#password").fill("Student123");
  await page.locator("#confirmPassword").fill("Student999");
  await page.locator("#department").selectOption("IT");
  await page.evaluate(() => {
    const checkbox = document.querySelector('input[name="acceptedTerms"]');
    if (!checkbox) return;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    checkbox.dispatchEvent(new Event("blur", { bubbles: true }));
  });
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page.getByText("Passwords do not match")).toBeVisible();
  await expect(page).toHaveURL(/\/register/);
});

test("register with valid data redirects to login", async ({ page }) => {
  let postedBody = null;
  await page.route("**/api/auth/register", async (route) => {
    postedBody = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          _id: "507f1f77bcf86cd799439012",
          name: "Student User",
          email: "student@example.com",
          role: "student",
        },
        token: "mock-register-token",
      }),
    });
  });

  await page.goto("/register");

  await page.locator("#name").fill("Student User");
  await page.locator("#email").fill("student@example.com");
  await page.locator("#password").fill("Student123");
  await page.locator("#confirmPassword").fill("Student123");
  await page.locator("#department").selectOption("IT");
  await page.locator('input[name="acceptedTerms"]').setChecked(true, { force: true });
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/login/);
  expect(postedBody).toMatchObject({
    name: "Student User",
    email: "student@example.com",
    password: "Student123",
    department: "IT",
    role: "student",
  });
});
