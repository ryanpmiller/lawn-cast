import { test, expect } from '@playwright/test';

test.describe('Inline Onboarding (Mobile)', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test('can complete onboarding with manual ZIP', async ({ page }) => {
		await page.goto('/');
		// Should see inline onboarding (not a modal)
		await expect(page.getByText(/Welcome to LawnCast!/i)).toBeVisible();
		await expect(page.getByText(/Set Your Location/i)).toBeVisible();

		// Enter ZIP manually
		await page.getByLabel('ZIP Code').fill('90210');
		await page.getByRole('button', { name: /continue/i }).click();

		// Step 2: Lawn Details
		await expect(page.getByText(/Lawn Details/i)).toBeVisible();
		await page.getByRole('button', { name: /partial shade/i }).click();
		await page
			.getByRole('combobox', { name: 'Grass Species' })
			.selectOption('tall_fescue');
		await page.getByRole('button', { name: /continue/i }).click();

		// Step 3: Sprinkler Setup
		await expect(page.getByText(/Sprinkler Calibration/i)).toBeVisible();
		// Use the slider instead of input field
		const slider = page.locator('input[type="range"]');
		await slider.fill('0.6');
		await page.getByRole('button', { name: /continue/i }).click();

		// Step 4: Notifications
		await expect(
			page.getByRole('heading', { name: /Notifications/i })
		).toBeVisible();
		await page.getByLabel(/enable notifications/i).click();
		// Click the Material-UI select dropdown to open it
		await page
			.getByRole('combobox', { name: /notification time/i })
			.click();
		// Select the 7:00 AM option from the dropdown
		await page.getByRole('option', { name: /7:00 AM/i }).click();
		await page.getByRole('button', { name: /get started/i }).click();

		// Should navigate to main app
		await expect(page.getByText(/Welcome to LawnCast!/i)).not.toBeVisible();
		await expect(
			page.getByText(/water today|no need to water/i)
		).toBeVisible({
			timeout: 10000,
		});
	});

	test('can use current location if available', async ({ page, context }) => {
		// Mock geolocation
		await context.grantPermissions(['geolocation']);
		await context.setGeolocation({
			latitude: 34.0522,
			longitude: -118.2437,
		});

		await page.goto('/');
		await expect(page.getByText(/Welcome to LawnCast!/i)).toBeVisible();

		// Click "Use My Current Location" button
		await page
			.getByRole('button', { name: /use my current location/i })
			.click();

		// Should automatically proceed to step 2 after location is determined
		await expect(page.getByText(/Lawn Details/i)).toBeVisible({
			timeout: 10000,
		});
	});
});
