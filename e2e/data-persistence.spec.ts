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
			localStorage.setItem('lawncast_v1', JSON.stringify({
				state: {
					settings: {
						zip: '20001',
						sprinklerRateInPerHr: 0.5
					},
					entries: {},
					cache: null
				},
				version: 0
			}));
		});

		await page.goto('/log');

		// Add some watering entries
		const inputs = page.locator('input[type="number"]');
		await inputs.first().fill('30');
		await inputs.nth(1).fill('45');

		// Navigate away and back
		await page.getByRole('link', { name: /home/i }).click();
		await page.getByRole('link', { name: /log/i }).click();

		// Entries should persist
		await expect(inputs.first()).toHaveValue('30');
		await expect(inputs.nth(1)).toHaveValue('45');
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
			localStorage.setItem('lawncast_v1', JSON.stringify({
				state: {
					settings: {
						zip: '20001',
						sprinklerRateInPerHr: 0.8
					},
					entries: {
						'2025-01-01': { date: '2025-01-01', minutes: 30 }
					},
					cache: null
				},
				version: 0
			}));
		});

		await page.goto('/settings');

		// Verify data exists
		await expect(page.getByLabel(/update zip code/i)).toHaveValue('20001');
		await expect(page.getByLabel(/sprinkler rate/i)).toHaveValue('0.8');

		// Clear all data
		await page.getByRole('button', { name: /clear all data/i }).first().click();
		await page.getByRole('button', { name: /clear all data/i }).nth(1).click();

		// Data should be cleared
		await expect(page.getByLabel(/update zip code/i)).toHaveValue('');
		await expect(page.getByLabel(/sprinkler rate/i)).toHaveValue('0.5'); // Default value

		// Check log page is also cleared
		await page.goto('/log');
		const inputs = page.locator('input[type="number"]');
		await expect(inputs.first()).toHaveValue('');
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
			localStorage.setItem('lawncast_v0', JSON.stringify({
				zip: '20001',
				rate: 0.5
			}));
		});

		await page.goto('/');

		// App should handle version migration gracefully
		await expect(page.getByText(/lawn/i)).toBeVisible();
	});
});