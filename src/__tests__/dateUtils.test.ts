import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPast7Dates, getStartDate } from '../api/dateUtils';

describe('Date Utilities', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('getPast7Dates', () => {
		it('should return 7 past dates not including today', () => {
			vi.setSystemTime(new Date('2025-01-07T12:00:00Z'));

			const result = getPast7Dates();

			expect(result).toEqual([
				'2024-12-31',
				'2025-01-01',
				'2025-01-02',
				'2025-01-03',
				'2025-01-04',
				'2025-01-05',
				'2025-01-06',
			]);
		});

		it('should handle month boundaries correctly', () => {
			vi.setSystemTime(new Date('2025-02-03T12:00:00Z'));

			const result = getPast7Dates();

			expect(result).toEqual([
				'2025-01-27',
				'2025-01-28',
				'2025-01-29',
				'2025-01-30',
				'2025-01-31',
				'2025-02-01',
				'2025-02-02',
			]);
		});

		it('should handle year boundaries correctly', () => {
			vi.setSystemTime(new Date('2025-01-03T12:00:00Z'));

			const result = getPast7Dates();

			expect(result).toEqual([
				'2024-12-27',
				'2024-12-28',
				'2024-12-29',
				'2024-12-30',
				'2024-12-31',
				'2025-01-01',
				'2025-01-02',
			]);
		});

		it('should handle leap year February correctly', () => {
			vi.setSystemTime(new Date('2024-03-03T12:00:00Z')); // 2024 is a leap year

			const result = getPast7Dates();

			expect(result).toEqual([
				'2024-02-25',
				'2024-02-26',
				'2024-02-27',
				'2024-02-28',
				'2024-02-29', // Leap day
				'2024-03-01',
				'2024-03-02',
			]);
		});

		it('should handle different times of day consistently', () => {
			// Morning
			vi.setSystemTime(new Date('2025-01-07T06:00:00Z'));
			const morningResult = getPast7Dates();

			// Evening
			vi.setSystemTime(new Date('2025-01-07T23:59:59Z'));
			const eveningResult = getPast7Dates();

			expect(morningResult).toEqual(eveningResult);
		});
	});

	describe('getStartDate', () => {
		it('should return the first date from array', () => {
			const dates = ['2025-01-01', '2025-01-02', '2025-01-03'];
			const result = getStartDate(dates);

			expect(result).toBe('2025-01-01');
		});

		it('should handle single date array', () => {
			const dates = ['2025-01-15'];
			const result = getStartDate(dates);

			expect(result).toBe('2025-01-15');
		});

		it('should handle empty array gracefully', () => {
			const dates: string[] = [];
			const result = getStartDate(dates);

			expect(result).toBe(undefined);
		});

		it('should work with unsorted dates', () => {
			const dates = ['2025-01-15', '2025-01-01', '2025-01-10'];
			const result = getStartDate(dates);

			// Should return the first element, not necessarily the earliest date
			expect(result).toBe('2025-01-15');
		});
	});
});
