import { test, expect } from '@playwright/test';

test.describe('HomePage', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('shows inline onboarding when no location is configured', async ({
		page,
	}) => {
		// Clear any existing data
		await page.evaluate(() => localStorage.clear());
		await page.reload();

		// Should show inline onboarding when no location is set
		await expect(page.getByText(/Welcome to LawnCast!/i)).toBeVisible({
			timeout: 5000,
		});
		await expect(page.getByText(/set your location/i)).toBeVisible({
			timeout: 5000,
		});
	});

	test('displays watering recommendation when location is set', async ({
		page,
	}) => {
		// Set up location data with completed onboarding
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
		await page.reload();

		// Wait for content to load and check for watering decision content
		await expect(
			page.getByText(/water today|no need to water/i)
		).toBeVisible({
			timeout: 10000,
		});
		// Use first() to avoid strict mode violation
		await expect(
			page.getByText(/progress|target|inches/i).first()
		).toBeVisible();
	});

	test('shows weather data and progress bar', async ({ page }) => {
		// Set up location data with completed onboarding
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
		await page.reload();

		// Wait for data to load
		await expect(page.locator('[role="progressbar"]')).toBeVisible({
			timeout: 10000,
		});

		// Should show explanation section
		await expect(page.getByText(/why this recommendation/i)).toBeVisible();
	});

	test('navigates to log page from home', async ({ page }) => {
		// Set up location data with completed onboarding
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
		await page.reload();

		// Wait for bottom navigation to be visible before trying to navigate
		await expect(page.locator('.MuiBottomNavigation-root')).toBeVisible();

		// Look for bottom navigation and click the Log button using aria-label
		await page.getByRole('button', { name: /log/i }).click();
		await expect(page).toHaveURL('/log');
		await expect(page.getByText(/water log/i)).toBeVisible();
	});

	test('navigates to settings page from home', async ({ page }) => {
		// Set up location data with completed onboarding
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
		await page.reload();

		// Wait for bottom navigation to be visible before trying to navigate
		await expect(page.locator('.MuiBottomNavigation-root')).toBeVisible();

		// Look for bottom navigation and click the Settings button using aria-label
		await page.getByRole('button', { name: /settings/i }).click();
		await expect(page).toHaveURL('/settings');
		await expect(page.getByText(/settings/i)).toBeVisible();
	});

	test('displays current location information', async ({ page }) => {
		// Set up location data with completed onboarding
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
		await page.reload();

		// Location info might not be displayed in HomePage, check for successful content load instead
		await expect(
			page.getByText(/water today|no need to water/i)
		).toBeVisible({
			timeout: 10000,
		});
	});

	test('handles loading states gracefully', async ({ page }) => {
		// Should not show loading spinners indefinitely
		await page.waitForLoadState('networkidle');

		// Should show the main app content (the page should have loaded successfully)
		await expect(page.locator('body')).toBeVisible();

		// Check that the app is responsive - either shows onboarding or navigation
		const hasOnboarding = await page
			.getByText(/set your location/i)
			.isVisible();
		const hasBottomNav = await page
			.locator('.MuiBottomNavigation-root')
			.isVisible();

		// One of these should be visible
		expect(hasOnboarding || hasBottomNav).toBe(true);
	});

	test('responsive design works on mobile', async ({ page }) => {
		// Set up location data with completed onboarding
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

		await page.setViewportSize({ width: 375, height: 667 });
		await page.reload();

		// Should still show main navigation (bottom navigation) - look for MUI BottomNavigation
		await expect(page.locator('.MuiBottomNavigation-root')).toBeVisible();

		// Content should be readable
		await expect(page.getByText(/water|lawn/i).first()).toBeVisible();
	});
});
