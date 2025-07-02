// Domain types for LawnCast

export type ClimateZone = '' | 'cool' | 'warm' | 'transition';
export type SunExposure = 'full' | 'partial' | 'shade';

export interface Settings {
	zip: string;
	lat: number;
	lon: number;
	zone: ClimateZone;
	grassSpecies:
		| 'kentucky_bluegrass'
		| 'tall_fescue'
		| 'bermuda'
		| 'zoysia'
		| 'st_augustine';
	sunExposure: SunExposure;
	sprinklerRateInPerHr: number; // default 0.5
	notificationsEnabled: boolean;
	notificationHour: number; // 0‑23, default 8
	theme: 'light' | 'dark' | 'system';
	onboardingComplete: boolean;
}

export interface WaterLogEntry {
	date: string; // YYYY‑MM‑DD
	minutes: number;
}

export interface WeatherCache {
	timestamp: number; // epoch ms
	observedInches: Record<string, { amount: number; pop: number }>;
	forecastInches: Record<string, { amount: number; pop: number }>;
}
