import react from '@vitejs/plugin-react';
import { defineConfig as defineVitestConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineVitestConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		exclude: ['e2e/**', 'node_modules', 'dist'],
	},
});
