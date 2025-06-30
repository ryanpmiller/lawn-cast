import { describe, it, expect } from 'vitest';
import {
	calculateDecision,
	getWeeklyTarget,
} from '../models/logic';

describe('Business Logic', () => {
	it('getWeeklyTarget returns correct values', () => {
		expect(getWeeklyTarget('cool', 'full')).toBe(1.0);
		expect(getWeeklyTarget('cool', 'partial')).toBe(0.75);
		expect(getWeeklyTarget('warm', 'shade')).toBe(0.4);
		expect(getWeeklyTarget('transition', 'partial')).toBe(0.65);
	});



	it('calculateDecision: exact target (no need to water)', () => {
		const res = calculateDecision({
			rainPast: 0.5,
			rainForecast: 0.25,
			loggedWater: 0.25,
			zone: 'cool',
			sunExposure: 'partial',
		});
		expect(res.weeklyTarget).toBe(0.75);
		expect(res.totalProjected).toBeCloseTo(1.0, 5);
		expect(res.decision).toBe('no');
		expect(res.progress).toBeCloseTo(1.0, 5);
	});

	it('calculateDecision: slight deficit (should water)', () => {
		const res = calculateDecision({
			rainPast: 0.2,
			rainForecast: 0.2,
			loggedWater: 0.2,
			zone: 'warm',
			sunExposure: 'full',
		});
		expect(res.weeklyTarget).toBe(0.75);
		expect(res.totalProjected).toBeCloseTo(0.6, 5);
		expect(res.decision).toBe('yes');
		expect(res.progress).toBeCloseTo(0.8, 5);
	});

	it('calculateDecision: surplus (no need to water)', () => {
		const res = calculateDecision({
			rainPast: 0.5,
			rainForecast: 0.5,
			loggedWater: 0.2,
			zone: 'transition',
			sunExposure: 'full',
		});
		expect(res.weeklyTarget).toBe(0.85);
		expect(res.totalProjected).toBeCloseTo(1.2, 5);
		expect(res.decision).toBe('no');
		expect(res.progress).toBeCloseTo(1.0, 5);
	});
});
