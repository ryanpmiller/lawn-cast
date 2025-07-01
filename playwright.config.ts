import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	use: {
		browserName: 'chromium',
		viewport: { width: 390, height: 844 },
		headless: true,
		baseURL: process.env.CI
			? 'http://localhost:4173'
			: 'http://localhost:5173',
	},
	projects: [
		{
			name: 'chromium-mobile',
			use: { ...devices['Pixel 5'] },
		},
	],
	webServer: process.env.CI
		? undefined
		: {
				command: 'npm run dev -- --port 5173',
				port: 5173,
				reuseExistingServer: !process.env.CI,
			},
});
