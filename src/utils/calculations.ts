import type { WeatherCache, WaterLogEntry } from '../models/types';

/**
 * Calculate total observed precipitation from weather cache
 */
export function calculateObservedPrecipitation(
	observedInches?: Record<string, { amount: number; pop: number }>
): number {
	if (!observedInches) return 0;
	return Object.values(observedInches).reduce((a, b) => a + b.amount, 0);
}

/**
 * Calculate total forecast precipitation for the week (PoP >= 60%)
 */
export function calculateForecastPrecipitation(
	forecastInches?: Record<string, { amount: number; pop: number }>
): number {
	if (!forecastInches) return 0;
	let total = 0;
	for (const day in forecastInches) {
		const { pop, amount } = forecastInches[day];
		if (pop >= 0.6) total += amount;
	}
	return total;
}

/**
 * Calculate total logged water from entries
 */
export function calculateLoggedWater(
	entries: Record<string, WaterLogEntry> | null,
	sprinklerRateInPerHr: number
): number {
	if (!entries) return 0;
	return Object.values(entries).reduce(
		(sum, entry) => sum + (sprinklerRateInPerHr * entry.minutes) / 60,
		0
	);
}

/**
 * Calculate all water amounts from cache and entries
 */
export function calculateWaterAmounts(
	cache: WeatherCache | null,
	entries: Record<string, WaterLogEntry> | null,
	sprinklerRateInPerHr: number
) {
	const rainPast = calculateObservedPrecipitation(cache?.observedInches);
	const rainForecast = calculateForecastPrecipitation(cache?.forecastInches);
	const loggedWater = calculateLoggedWater(entries, sprinklerRateInPerHr);

	return {
		rainPast,
		rainForecast,
		loggedWater,
	};
}
