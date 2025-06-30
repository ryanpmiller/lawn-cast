import { test, expect } from '@playwright/test';

test.describe('BottomNavigation', () => {
	test('navigates between Home, Log, and Settings', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();

		await page.getByRole('button', { name: 'Log' }).click();
		await expect(page.getByRole('heading', { name: 'Log' })).toBeVisible();

		await page.getByRole('button', { name: 'Settings' }).click();
		await expect(
			page.getByRole('heading', { name: 'Settings' })
		).toBeVisible();

		await page.getByRole('button', { name: 'Home' }).click();
		await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
	});
});
