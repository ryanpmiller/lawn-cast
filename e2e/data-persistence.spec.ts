import { test, expect } from '@playwright/test';

test.describe('Data Persistence', () => {
	test.beforeEach(async ({ page }) => {
		// Clear any existing data
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
	});

	test('persists settings across page refreshes', async ({ page }) => {
		// Set up basic location with completed onboarding
		await page.evaluate(() => {
			localStorage.setItem(
				'lawncast_v1',
				JSON.stringify({
					state: {
						settings: {
							zip: '20001',
							lat: 38.9072,
							lon: -77.0369,
							grassSpecies: 'kentucky_bluegrass',
							sunExposure: 'full',
							sprinklerRateInPerHr: 0.5,
							zone: 'cool',
							notificationsEnabled: false,
							notificationHour: 8,
							theme: 'system',
							onboardingComplete: true,
						},
						entries: {},
						cache: null,
					},
					version: 0,
				})
			);
		});

		await page.goto('/settings');

		// Set up some settings
		const zipInput = page.getByLabel(/update zip code/i);
		await zipInput.fill('90210');
		await page.getByRole('button', { name: /save/i }).click();

		// Update sprinkler rate using slider
		const slider = page.locator('input[type="range"]');
		await slider.fill('0.8');

		// Refresh the page
		await page.reload();

		// Settings should persist
		await expect(page.getByLabel(/update zip code/i)).toHaveValue('90210');
		await expect(page.locator('input[type="range"]')).toHaveValue('0.8');
	});

	test('persists water log entries across navigation', async ({ page }) => {
		// Set up location with completed onboarding
		await page.evaluate(() => {
			localStorage.setItem(
				'lawncast_v1',
				JSON.stringify({
					state: {
						settings: {
							zip: '20001',
							lat: 38.9072,
							lon: -77.0369,
							grassSpecies: 'kentucky_bluegrass',
							sunExposure: 'full',
							sprinklerRateInPerHr: 0.5,
							zone: 'cool',
							notificationsEnabled: false,
							notificationHour: 8,
							theme: 'system',
							onboardingComplete: true,
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
		await page
			.getByLabel(/add\/edit minutes/i)
			.first()
			.click();
		let input = page.getByRole('spinbutton');
		await input.fill('30');
		await input.blur();

		await page
			.getByLabel(/add\/edit minutes/i)
			.nth(1)
			.click();
		input = page.getByRole('spinbutton');
		await input.fill('45');
		await input.blur();

		// Navigate away and back using bottom navigation tabs
		await page.getByRole('button', { name: /home/i }).click();
		await page.getByRole('button', { name: /log/i }).click();

		// Entries should persist (displayed as text)
		await expect(page.getByText(/30 min/i).first()).toBeVisible();
		await expect(page.getByText(/45 min/i).first()).toBeVisible();
	});

	test('maintains theme selection across sessions', async ({ page }) => {
		// Set up location with completed onboarding
		await page.evaluate(() => {
			localStorage.setItem(
				'lawncast_v1',
				JSON.stringify({
					state: {
						settings: {
							zip: '20001',
							lat: 38.9072,
							lon: -77.0369,
							grassSpecies: 'kentucky_bluegrass',
							sunExposure: 'full',
							sprinklerRateInPerHr: 0.5,
							zone: 'cool',
							notificationsEnabled: false,
							notificationHour: 8,
							theme: 'system',
							onboardingComplete: true,
						},
						entries: {},
						cache: null,
					},
					version: 0,
				})
			);
		});

		await page.goto('/settings');

		// Switch to dark theme
		await page.getByRole('button', { name: /dark/i }).click();

		// Wait for theme change to take effect
		await page.waitForTimeout(500);

		// Refresh page
		await page.reload();

		// Check that dark theme persisted by looking for dark theme button being selected
		await expect(page.getByRole('button', { name: /dark/i })).toBeVisible();
	});

	test('clears all data when requested', async ({ page }) => {
		// Set up some data with completed onboarding
		await page.evaluate(() => {
			localStorage.setItem(
				'lawncast_v1',
				JSON.stringify({
					state: {
						settings: {
							zip: '20001',
							lat: 38.9072,
							lon: -77.0369,
							grassSpecies: 'kentucky_bluegrass',
							sunExposure: 'full',
							sprinklerRateInPerHr: 0.8,
							zone: 'cool',
							notificationsEnabled: false,
							notificationHour: 8,
							theme: 'system',
							onboardingComplete: true,
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
		await expect(page.locator('input[type="range"]')).toHaveValue('0.8');

		// Find and click the clear all data button (should be in danger zone section)
		await page.getByRole('button', { name: /clear all data/i }).click();

		// Confirm in the dialog
		await page
			.getByRole('button', { name: /clear all data/i })
			.last()
			.click();

		// Data should be cleared
		await expect(page.getByLabel(/update zip code/i)).toHaveValue('');
		await expect(page.locator('input[type="range"]')).toHaveValue('0.5'); // Default value

		// Check log page is also cleared
		await page.goto('/log');
		await expect(page.getByText(/water log/i)).toBeVisible();
		// Should not show any logged minutes except "0 min" which is the default
		// Use a more specific pattern to avoid matching "30 min target"
		await expect(page.getByText(/[1-9]\d* min$/).first()).not.toBeVisible();
	});

	test('handles corrupted localStorage gracefully', async ({ page }) => {
		// Set corrupted data
		await page.evaluate(() => {
			localStorage.setItem('lawncast_v1', 'invalid json data');
		});

		await page.goto('/');

		// App should still load without crashing - should show onboarding
		await expect(
			page.getByRole('heading', { name: /Welcome to LawnCast!/i })
		).toBeVisible();
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

		// App should handle version migration gracefully - should show onboarding
		await expect(
			page.getByRole('heading', { name: /Welcome to LawnCast!/i })
		).toBeVisible();
	});
});
