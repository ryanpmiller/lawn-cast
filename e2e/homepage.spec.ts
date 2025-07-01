import { test, expect } from '@playwright/test';

test.describe('HomePage', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('shows location setup when no location is configured', async ({ page }) => {
		// Clear any existing data
		await page.evaluate(() => localStorage.clear());
		await page.reload();

		await expect(page.getByText(/set your location/i)).toBeVisible();
		await expect(page.getByRole('button', { name: /set location/i })).toBeVisible();
	});

	test('displays watering recommendation when location is set', async ({ page }) => {
		// Set up location data
		await page.evaluate(() => {
			localStorage.setItem('lawncast_v1', JSON.stringify({
				state: {
					settings: {
						zip: '20001',
						lat: 38.9072,
						lon: -77.0369,
						grassSpecies: 'kentucky_bluegrass',
						sunExposure: 'full',
						sprinklerRateInPerHr: 0.5
					},
					entries: {},
					cache: null
				},
				version: 0
			}));
		});
		await page.reload();

		await expect(page.getByText(/watering recommendation/i)).toBeVisible();
		await expect(page.getByText(/this week's water/i)).toBeVisible();
	});

	test('shows weather data and progress bar', async ({ page }) => {
		// Set up location data
		await page.evaluate(() => {
			localStorage.setItem('lawncast_v1', JSON.stringify({
				state: {
					settings: {
						zip: '20001',
						lat: 38.9072,
						lon: -77.0369,
						grassSpecies: 'kentucky_bluegrass',
						sunExposure: 'full',
						sprinklerRateInPerHr: 0.5
					},
					entries: {},
					cache: null
				},
				version: 0
			}));
		});
		await page.reload();

		// Wait for data to load
		await expect(page.locator('[role="progressbar"]')).toBeVisible({ timeout: 10000 });

		// Should show explanation section
		await expect(page.getByText(/explanation/i)).toBeVisible();
	});

	test('navigates to log page from home', async ({ page }) => {
		await page.getByRole('link', { name: /log/i }).click();
		await expect(page).toHaveURL('/log');
		await expect(page.getByText(/log watering/i)).toBeVisible();
	});

	test('navigates to settings page from home', async ({ page }) => {
		await page.getByRole('link', { name: /settings/i }).click();
		await expect(page).toHaveURL('/settings');
		await expect(page.getByText(/settings/i)).toBeVisible();
	});

	test('displays current location information', async ({ page }) => {
		// Set up location data
		await page.evaluate(() => {
			localStorage.setItem('lawncast_v1', JSON.stringify({
				state: {
					settings: {
						zip: '20001',
						lat: 38.9072,
						lon: -77.0369,
						grassSpecies: 'kentucky_bluegrass',
						sunExposure: 'full',
						sprinklerRateInPerHr: 0.5
					},
					entries: {},
					cache: null
				},
				version: 0
			}));
		});
		await page.reload();

		await expect(page.getByText(/20001/)).toBeVisible();
	});

	test('handles loading states gracefully', async ({ page }) => {
		// Should not show loading spinners indefinitely
		await page.waitForLoadState('networkidle');

		// Main content should be visible
		await expect(page.getByText(/watering recommendation|set your location/i)).toBeVisible();
	});

	test('responsive design works on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });

		// Should still show main navigation
		await expect(page.getByRole('navigation')).toBeVisible();

		// Content should be readable
		await expect(page.getByText(/lawn/i)).toBeVisible();
	});
});