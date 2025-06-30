import { format, startOfWeek, addDays } from 'date-fns';

/**
 * Get the current date as a formatted string
 */
export function getCurrentDateString(): string {
	return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get today's date as a Date object (for consistency)
 */
export function getToday(): Date {
	return new Date();
}

/**
 * Generate week dates array (Sunday through Saturday)
 */
export function getWeekDates(): string[] {
	return Array.from({ length: 7 }, (_, i) => {
		const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // 0 = Sunday
		const currentDay = addDays(weekStart, i);
		return format(currentDay, 'yyyy-MM-dd');
	});
}

/**
 * Check if a date string represents today
 */
export function isToday(dateString: string): boolean {
	return getCurrentDateString() === dateString;
}

/**
 * Format a date for display (e.g., "Monday", "Tuesday")
 */
export function formatDayName(dateString: string): string {
	return format(new Date(dateString), 'EEEE');
}
