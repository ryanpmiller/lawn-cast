import type {
	ClimateZone,
	SunExposure,
	Settings,
	WaterLogEntry,
	WeatherCache,
} from '../models/types';
import { describe, it } from 'vitest';

describe('TypeScript domain types', () => {
	it('should compile without type errors', () => {
		// No runtime assertions needed; this test passes if types compile
		const zone: ClimateZone = 'cool';
		const sun: SunExposure = 'full';
		const settings: Settings = {
			zip: '12345',
			lat: 40.0,
			lon: -75.0,
			zone: 'cool',
			grassSpecies: 'kentucky_bluegrass',
			sunExposure: 'full',
			sprinklerRateInPerHr: 0.5,
			notificationsEnabled: true,
			notificationHour: 8,
			theme: 'light',
			onboardingComplete: false,
		};
		const log: WaterLogEntry = { date: '2025-06-13', minutes: 30 };
		const cache: WeatherCache = {
			timestamp: Date.now(),
			observedInches: { '2025-06-13': { amount: 0.1, pop: 1.0 } },
			forecastInches: { '2025-06-14': { pop: 0.7, amount: 0.2 } },
		};
		void zone;
		void sun;
		void settings;
		void log;
		void cache;
	});
});
