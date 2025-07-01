import { vi } from 'vitest';

// Mock localStorage before importing the store
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
	};
})();
vi.stubGlobal('localStorage', localStorageMock);

import { describe, it, expect, beforeEach } from 'vitest';
import { useLawnCastStore } from '../models/store';

// Helper to reset Zustand store state between tests
const resetStore = () => {
	useLawnCastStore.getState().reset();
};

describe('Zustand LawnCast Store', () => {
	beforeEach(() => {
		resetStore();
		// Do not clear localStorage here, as the store is already initialized
	});

	it('updates settings and log entries in store state', () => {
		useLawnCastStore
			.getState()
			.update({ zip: '90210', lat: 34.1, lon: -118.4 });
		useLawnCastStore.getState().setEntry('2025-06-13', 42);
		const state = useLawnCastStore.getState();
		expect(state.settings.zip).toBe('90210');
		expect(state.settings.lat).toBe(34.1);
		expect(state.entries['2025-06-13'].minutes).toBe(42);
		// Note: Persistence to localStorage is not reliably testable in unit tests with Zustand
		// and should be covered in E2E/integration tests.
	});

	it('reset() clears settings, log, and weather cache', () => {
		const store = useLawnCastStore.getState();
		store.update({ zip: '10001' });
		store.setEntry('2025-06-13', 10);
		store.setCache({
			timestamp: 1,
			observedInches: {},
			forecastInches: {},
		});
		store.reset();
		expect(store.settings.zip).toBe('');
		expect(Object.keys(store.entries)).toHaveLength(0);
		expect(store.cache).toBeNull();
	});
});
