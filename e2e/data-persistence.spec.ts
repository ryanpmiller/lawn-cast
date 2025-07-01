import { test, expect } from '@playwright/test';

test.describe('Data Persistence', () => {
	test.beforeEach(async ({ page }) => {
		// Clear any existing data
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
	});

	test('persists settings across page refreshes', async ({ page }) => {
		await page.goto('/settings');

		// Set up some settings
		const zipInput = page.getByLabel(/update zip code/i);
		await zipInput.fill('90210');
		await zipInput.blur();

		const rateInput = page.getByLabel(/sprinkler rate/i);
		await rateInput.fill('0.8');

		// Refresh the page
		await page.reload();

		// Settings should persist
		await expect(page.getByLabel(/update zip code/i)).toHaveValue('90210');
		await expect(page.getByLabel(/sprinkler rate/i)).toHaveValue('0.8');
	});

	test('persists water log entries across navigation', async ({ page }) => {
		// Set up location first
		await page.evaluate(() => {
			localStorage.setItem(
				'lawncast_v1',
				JSON.stringify({
					state: {
						settings: {
							zip: '20001',
							sprinklerRateInPerHr: 0.5,
						},
						entries: {},
						cache: null,
					},
					version: 0,
				})
			);
		});

		await page.goto('/log');
		await expect(page.getByText(/water log/i)).toBeVisible();

		// Add some watering entries by clicking edit buttons
		await page.getByLabel(/add\/edit minutes/i).first().click();
		let input = page.getByRole('spinbutton');
		await input.fill('30');
		await input.blur();

		await page.getByLabel(/add\/edit minutes/i).nth(1).click();
		input = page.getByRole('spinbutton');
		await input.fill('45');
		await input.blur();

		// Navigate away and back
		await page.getByRole('link', { name: /home/i }).click();
		await page.getByRole('link', { name: /log/i }).click();

		// Entries should persist (displayed as text)
		await expect(page.getByText(/30 min/i)).toBeVisible();
		await expect(page.getByText(/45 min/i)).toBeVisible();
	});

	test('maintains theme selection across sessions', async ({ page }) => {
		await page.goto('/settings');

		// Switch to dark theme
		await page.getByRole('button', { name: /dark/i }).click();

		// Check that dark theme is applied
		const body = page.locator('body');
		await expect(body).toHaveAttribute('data-theme', 'dark');

		// Refresh page
		await page.reload();

		// Theme should persist
		await expect(body).toHaveAttribute('data-theme', 'dark');
	});

	test('clears all data when requested', async ({ page }) => {
		// Set up some data
		await page.evaluate(() => {
			localStorage.setItem(
				'lawncast_v1',
				JSON.stringify({
					state: {
						settings: {
							zip: '20001',
							sprinklerRateInPerHr: 0.8,
						},
						entries: {
							'2025-01-01': { date: '2025-01-01', minutes: 30 },
						},
						cache: null,
					},
					version: 0,
				})
			);
		});

		await page.goto('/settings');

		// Verify data exists
		await expect(page.getByLabel(/update zip code/i)).toHaveValue('20001');
		await expect(page.getByLabel(/sprinkler rate/i)).toHaveValue('0.8');

		// Clear all data
		await page
			.getByRole('button', { name: /clear all data/i })
			.first()
			.click();
		await page
			.getByRole('button', { name: /clear all data/i })
			.nth(1)
			.click();

		// Data should be cleared
		await expect(page.getByLabel(/update zip code/i)).toHaveValue('');
		await expect(page.getByLabel(/sprinkler rate/i)).toHaveValue('0.5'); // Default value

		// Check log page is also cleared
		await page.goto('/log');
		await expect(page.getByText(/water log/i)).toBeVisible();
		// Should not show any logged minutes
		await expect(page.getByText(/\d+ min/)).not.toBeVisible();
	});

	test('handles corrupted localStorage gracefully', async ({ page }) => {
		// Set corrupted data
		await page.evaluate(() => {
			localStorage.setItem('lawncast_v1', 'invalid json data');
		});

		await page.goto('/');

		// App should still load without crashing
		await expect(page.getByText(/lawn/i)).toBeVisible();
	});

	test('migrates data between app versions', async ({ page }) => {
		// Set up old version data format
		await page.evaluate(() => {
			localStorage.setItem(
				'lawncast_v0',
				JSON.stringify({
					zip: '20001',
					rate: 0.5,
				})
			);
		});

		await page.goto('/');

		// App should handle version migration gracefully
		await expect(page.getByText(/lawn/i)).toBeVisible();
	});
});
