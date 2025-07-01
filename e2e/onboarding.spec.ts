import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard (Mobile)', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test('can complete onboarding with manual ZIP', async ({ page }) => {
		await page.goto('/');
		// Should see onboarding modal
		await expect(
			page.getByRole('dialog', { name: /step 1/i })
		).toBeVisible();
		// Click 'Enter ZIP manually'
		await page.getByRole('button', { name: /enter zip manually/i }).click();
		// Type ZIP and continue
		await page.getByLabel('ZIP code').fill('90210');
		await page.getByRole('button', { name: /continue/i }).click();
		// Step 2: Sun exposure
		await expect(
			page.getByRole('dialog', { name: /step 2/i })
		).toBeVisible();
		await page.getByRole('button', { name: /partial shade/i }).click();
		await page
			.getByRole('combobox', { name: 'Grass Species' })
			.selectOption({ label: 'Tall Fescue' });
		await page.getByRole('button', { name: /continue/i }).click();
		// Step 3: Sprinkler calibration
		await expect(
			page.getByRole('dialog', { name: /step 3/i })
		).toBeVisible();
		await page.getByLabel(/sprinkler rate/i).fill('0.6');
		await page.getByRole('button', { name: /continue/i }).click();
		// Step 4: Notifications
		await expect(
			page.getByRole('dialog', { name: /step 4/i })
		).toBeVisible();
		await page.getByLabel(/enable notifications/i).click();
		await page.getByLabel(/notification time/i).click();
		await page.getByRole('option', { name: '7:00 AM' }).click();
		await page.getByRole('button', { name: /finish/i }).click();
		// Modal should close
		await expect(page.getByRole('dialog')).not.toBeVisible();
	});

	test('can skip onboarding after setting location', async ({ page }) => {
		await page.goto('/');
		// Step 1: Location is required, so we need to set it first
		await page.getByRole('button', { name: /enter zip manually/i }).click();
		await page.getByLabel('ZIP code').fill('90210');
		await page.getByRole('button', { name: /continue/i }).click();

		// Step 2: Now we can skip the rest
		await expect(
			page.getByRole('dialog', { name: /step 2/i })
		).toBeVisible();
		await page.getByRole('button', { name: /skip for now/i }).click();
		await expect(page.getByRole('dialog')).not.toBeVisible();
		// Settings should have location but default values for other fields
	});
});
