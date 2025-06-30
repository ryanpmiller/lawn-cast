import type { ClimateZone, SunExposure } from './types';

export function getWeeklyTarget(zone: ClimateZone, sun: SunExposure): number {
	// Spec lookup table
	if (zone === 'cool') {
		if (sun === 'full') return 1.0;
		if (sun === 'partial') return 0.75;
		return 0.5;
	}
	if (zone === 'warm') {
		if (sun === 'full') return 0.75;
		if (sun === 'partial') return 0.5;
		return 0.4;
	}
	// transition
	if (sun === 'full') return 0.85;
	if (sun === 'partial') return 0.65;
	return 0.45;
}

export interface CalculateDecisionInput {
	rainPast: number; // inches
	rainForecast: number; // inches
	loggedWater: number; // inches
	zone: ClimateZone;
	sunExposure: SunExposure;
}

export interface CalculateDecisionResult {
	decision: 'yes' | 'no';
	totalProjected: number;
	weeklyTarget: number;
	progress: number; // 0-1, capped at 1
}

export function calculateDecision({
	rainPast,
	rainForecast,
	loggedWater,
	zone,
	sunExposure,
}: CalculateDecisionInput): CalculateDecisionResult {
	const weeklyTarget = getWeeklyTarget(zone, sunExposure);
	const totalProjected = rainPast + rainForecast + loggedWater;
	const decision = totalProjected < weeklyTarget ? 'yes' : 'no';
	const progress = Math.min(totalProjected / weeklyTarget, 1);
	return { decision, totalProjected, weeklyTarget, progress };
}

export function minutesToInches(
	minutes: number,
	sprinklerRate: number
): number {
	// sprinklerRate is in inches/hour
	return (minutes / 60) * sprinklerRate;
}
