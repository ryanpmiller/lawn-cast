/**
 * Grass species options used across the application
 */
export const GRASS_SPECIES_OPTIONS = [
	{ value: 'kentucky_bluegrass', label: 'Kentucky Bluegrass' },
	{ value: 'tall_fescue', label: 'Tall Fescue' },
	{ value: 'bermuda', label: 'Bermuda' },
	{ value: 'zoysia', label: 'Zoysia' },
	{ value: 'st_augustine', label: 'St. Augustine' },
] as const;

/**
 * Sun exposure options used across the application
 */
export const SUN_EXPOSURE_OPTIONS = [
	{ value: 'full', label: 'Full Sun (6+ hrs)' },
	{ value: 'partial', label: 'Partial Shade (3-6 hrs)' },
	{ value: 'shade', label: 'Full Shade (<3 hrs)' },
] as const;

/**
 * Climate zones for grass recommendations
 */
export const CLIMATE_ZONES = ['cool', 'warm', 'transition'] as const;

/**
 * Grass species recommendations by zone and sun exposure
 */
export const GRASS_RECOMMENDATIONS = {
	cool: {
		full: ['kentucky_bluegrass', 'tall_fescue'],
		partial: ['kentucky_bluegrass', 'tall_fescue'],
		shade: ['tall_fescue'],
	},
	warm: {
		full: ['bermuda', 'zoysia', 'st_augustine'],
		partial: ['zoysia', 'st_augustine'],
		shade: ['st_augustine'],
	},
	transition: {
		full: ['tall_fescue', 'zoysia'],
		partial: ['tall_fescue', 'zoysia'],
		shade: ['tall_fescue'],
	},
} as const;
