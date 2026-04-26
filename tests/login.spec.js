import { test, expect } from '@playwright/test';

test('login page loads', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
  await expect(page.getByRole('button', { name: /^login$/i })).toBeVisible();
});

test('login with invalid credentials', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid email or password' }),
    });
  });

  await page.goto('/login');

  await page.locator('#email').fill('admin@gmail.com');
  await page.locator('#password').fill('wrong');

  await page.getByRole('button', { name: /login/i }).click();
  await expect(page.getByRole('button', { name: /^login$/i })).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('lms_token'))).toBeNull();
});

test('login with valid admin', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Admin',
          email: 'admin@gmail.com',
          role: 'admin',
        },
        token: 'mock-jwt-token-for-playwright-test',
      }),
    });
  });

  await page.goto('/login');

  await page.locator('#email').fill('admin@gmail.com');
  await page.locator('#password').fill('Admin@123');

  await page.getByRole('button', { name: /login/i }).click();

  await expect(page).toHaveURL(/\/admin/);
  await expect
    .poll(async () => page.evaluate(() => localStorage.getItem('lms_token')))
    .toBe('mock-jwt-token-for-playwright-test');
});
