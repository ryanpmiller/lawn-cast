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
		await page.goto('/');
		await page.getByRole('button', { name: /log/i }).click();
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
		await page.getByLabel('Edit minutes for Monday').click();
		const input = page.getByRole('spinbutton', { name: 'Minutes' });
		await input.fill('42');
		await page.getByRole('button', { name: /save/i }).click();
		await expect(page.getByText('Monday')).toBeVisible();
		await expect(page.getByText('42')).toBeVisible();
	});

	test('shows validation for out-of-range input', async ({ page }) => {
		await page.getByLabel('Edit minutes for Tuesday').click();
		const input = page.getByRole('spinbutton', { name: 'Minutes' });
		await input.fill('999');
		await page.getByRole('button', { name: /save/i }).click();
		await expect(
			page.getByText(/enter a value between 0 and 240/i)
		).toBeVisible();
	});

	test('disables edits when offline', async ({ page }) => {
		await setOffline(page, true);
		const editBtn = page.getByLabel('Edit minutes for Wednesday');
		await expect(editBtn).toBeDisabled();
		await setOffline(page, false);
	});
});
