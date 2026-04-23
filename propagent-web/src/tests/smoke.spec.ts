import { test, expect } from '@playwright/test';

test('homepage responds', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBeTruthy();
});

test('privacy page responds', async ({ page }) => {
  const response = await page.goto('/privacy');
  expect(response?.ok()).toBeTruthy();
});

test('terms page responds', async ({ page }) => {
  const response = await page.goto('/terms');
  expect(response?.ok()).toBeTruthy();
});
