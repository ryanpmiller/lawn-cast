import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	use: {
		browserName: 'chromium',
		viewport: { width: 390, height: 844 },
		headless: true,
		baseURL: 'http://localhost:5173',
	},
	projects: [
		{
			name: 'chromium-mobile',
			use: { ...devices['Pixel 5'] },
		},
	],
	webServer: {
		command: 'npm run dev -- --port 5173',
		port: 5173,
		reuseExistingServer: !process.env.CI,
	},
});
