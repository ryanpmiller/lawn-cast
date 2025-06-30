import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, WaterLogEntry, WeatherCache } from './types';

// Settings Slice
interface SettingsSlice {
	settings: Settings;
	update: (partial: Partial<Settings>) => void;
	reset: () => void;
}

// Log Slice
interface LogSlice {
	entries: Record<string, WaterLogEntry>;
	setEntry: (date: string, minutes: number) => void;
	clearWeek: (isoWeek: string) => void;
}

// Weather Slice
interface WeatherSlice {
	cache: WeatherCache | null;
	setCache: (cache: WeatherCache) => void;
}

// Default settings for initial state (should be replaced with onboarding values)
const defaultSettings: Settings = {
	zip: '',
	lat: 0,
	lon: 0,
	zone: '',
	grassSpecies: 'kentucky_bluegrass',
	sunExposure: 'full',
	sprinklerRateInPerHr: 0.5,
	notificationsEnabled: false,
	notificationHour: 8,
	theme: 'system',
};

export const useLawnCastStore = create<
	SettingsSlice & LogSlice & WeatherSlice
>()(
	persist(
		set => ({
			// Settings slice
			settings: defaultSettings,
			update: partial =>
				set(state => ({ settings: { ...state.settings, ...partial } })),
			reset: () =>
				set(() => ({
					settings: defaultSettings,
					entries: {},
					cache: null,
				})),

			// Log slice
			entries: {},
			setEntry: (date, minutes) =>
				set(state => ({
					entries: {
						...state.entries,
						[date]: { date, minutes },
					},
				})),
			clearWeek: isoWeek =>
				set(state => {
					const newEntries = { ...state.entries };
					Object.keys(newEntries).forEach(date => {
						if (date.startsWith(isoWeek)) delete newEntries[date];
					});
					return { entries: newEntries };
				}),

			// Weather slice
			cache: null,
			setCache: cache => set(() => ({ cache })),
		}),
		{
			name: 'lawncast_v1',
		}
	)
);
