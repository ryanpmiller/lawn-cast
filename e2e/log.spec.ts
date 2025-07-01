import { test, expect, Page } from '@playwright/test';

// Helper to go offline/online (simulate in browser context for navigator.onLine)
async function setOffline(page: Page, offline: boolean) {
	await page.evaluate(offline => {
		Object.defineProperty(window.navigator, 'onLine', {
			configurable: true,
			get: () => !offline,
		});
		window.dispatchEvent(new Event(offline ? 'offline' : 'online'));
	}, offline);
}

test.describe('Log Tab CRUD', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/log');
		// Wait for the page to load
		await expect(page.getByText(/water log/i)).toBeVisible();
	});

	test('renders week table', async ({ page }) => {
		for (const day of [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
		]) {
			await expect(page.getByText(day)).toBeVisible();
		}
	});

	test("can edit a day's minutes", async ({ page }) => {
		// Click the add/edit button for the first day
		await page
			.getByLabel(/add\/edit minutes/i)
			.first()
			.click();
		const input = page.getByRole('spinbutton');
		await input.fill('42');
		// Blur the input to save (no explicit save button)
		await input.blur();
		await expect(page.getByText(/42 min/i)).toBeVisible();
	});

	test('shows validation for out-of-range input', async ({ page }) => {
		await page
			.getByLabel(/add\/edit minutes/i)
			.nth(1)
			.click();
		const input = page.getByRole('spinbutton');
		await input.fill('999');
		await input.blur();
		await expect(
			page.getByText(/enter a value between 0 and 240/i)
		).toBeVisible();
	});

	test('disables edits when offline', async ({ page }) => {
		await setOffline(page, true);
		const editBtn = page.getByLabel(/add\/edit minutes/i).nth(2);
		await expect(editBtn).toBeDisabled();
		await setOffline(page, false);
	});
});
