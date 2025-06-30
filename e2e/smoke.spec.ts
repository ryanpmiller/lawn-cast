import { test, expect } from '@playwright/test';

// Start the Vite dev server before running tests
// (Playwright will automatically use the baseURL from the config)
test.describe('Smoke test', () => {
	test('loads home page and checks title', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/LawnCast/i);
	});
});
