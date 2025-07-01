import { describe, it, expect, vi } from 'vitest';
import { getPrecip } from '../api/nws';
import * as fetcher from '../api/fetcher';

// Mock the fetcher module
vi.mock('../api/fetcher');

describe('NWS API Integration', () => {
	it('should return precipitation data with correct structure', async () => {
		// Mock successful NWS API responses
		const mockPointResponse = {
			properties: {
				gridId: 'LWX',
				gridX: 97,
				gridY: 71,
				forecast:
					'https://api.weather.gov/gridpoints/LWX/97,71/forecast',
				forecastHourly:
					'https://api.weather.gov/gridpoints/LWX/97,71/forecast/hourly',
				forecastGridData:
					'https://api.weather.gov/gridpoints/LWX/97,71',
			},
		};

		const mockGridResponse = {
			properties: {
				probabilityOfPrecipitation: {
					values: [
						{
							validTime: '2025-01-01T12:00:00+00:00/PT6H',
							value: 70,
						},
						{
							validTime: '2025-01-01T18:00:00+00:00/PT6H',
							value: 60,
						},
					],
				},
				quantitativePrecipitation: {
					values: [
						{
							validTime: '2025-01-01T12:00:00+00:00/PT6H',
							value: 2.54, // 2.54mm = 0.1 inches
						},
						{
							validTime: '2025-01-01T18:00:00+00:00/PT6H',
							value: 1.27, // 1.27mm = 0.05 inches
						},
					],
				},
			},
		};

		// Mock fetchJson to return our test data
		vi.mocked(fetcher.fetchJson)
			.mockResolvedValueOnce(mockPointResponse)
			.mockResolvedValueOnce(mockGridResponse);

		const result = await getPrecip(
			39.0458,
			-76.6413,
			'2025-01-01',
			'2025-01-07'
		);

		expect(result).toBeDefined();
		expect(result['2025-01-01']).toBeDefined();
		expect(result['2025-01-01']).toEqual({
			amount: expect.any(Number),
			pop: expect.any(Number),
		});

		// Verify the precipitation amount is summed correctly (0.1 + 0.05 = 0.15 inches)
		expect(result['2025-01-01'].amount).toBeCloseTo(0.15, 2);

		// Verify the PoP is the maximum (70% = 0.7)
		expect(result['2025-01-01'].pop).toBe(0.7);
	});

	it('should handle API errors gracefully', async () => {
		// Mock fetchJson to throw an error
		vi.mocked(fetcher.fetchJson).mockRejectedValue(
			new Error('Network error')
		);

		const result = await getPrecip(
			39.0458,
			-76.6413,
			'2025-01-01',
			'2025-01-07'
		);

		expect(result).toEqual({});
	});

	it('should handle missing precipitation data', async () => {
		const mockPointResponse = {
			properties: {
				gridId: 'LWX',
				gridX: 97,
				gridY: 71,
				forecast:
					'https://api.weather.gov/gridpoints/LWX/97,71/forecast',
				forecastHourly:
					'https://api.weather.gov/gridpoints/LWX/97,71/forecast/hourly',
				forecastGridData:
					'https://api.weather.gov/gridpoints/LWX/97,71',
			},
		};

		const mockGridResponse = {
			properties: {
				probabilityOfPrecipitation: {
					values: [
						{
							validTime: '2025-01-01T12:00:00+00:00/PT6H',
							value: 0, // 0% chance of precipitation
						},
					],
				},
				quantitativePrecipitation: {
					values: [
						{
							validTime: '2025-01-01T12:00:00+00:00/PT6H',
							value: null, // No precipitation amount
						},
					],
				},
			},
		};

		vi.mocked(fetcher.fetchJson)
			.mockResolvedValueOnce(mockPointResponse)
			.mockResolvedValueOnce(mockGridResponse);

		const result = await getPrecip(
			39.0458,
			-76.6413,
			'2025-01-01',
			'2025-01-07'
		);

		expect(result['2025-01-01']).toEqual({
			amount: 0,
			pop: 0,
		});
	});

	it('should handle malformed point response', async () => {
		const malformedResponse = {
			properties: {
				// Missing required fields
			},
		};

		vi.mocked(fetcher.fetchJson).mockResolvedValue(malformedResponse);

		const result = await getPrecip(
			39.0458,
			-76.6413,
			'2025-01-01',
			'2025-01-07'
		);

		expect(result).toEqual({});
	});

	it('should handle malformed grid response', async () => {
		const mockPointResponse = {
			properties: {
				gridId: 'LWX',
				gridX: 97,
				gridY: 71,
				forecastGridData:
					'https://api.weather.gov/gridpoints/LWX/97,71',
			},
		};

		const malformedGridResponse = {
			properties: {
				// Missing precipitation data
			},
		};

		vi.mocked(fetcher.fetchJson)
			.mockResolvedValueOnce(mockPointResponse)
			.mockResolvedValueOnce(malformedGridResponse);

		const result = await getPrecip(
			39.0458,
			-76.6413,
			'2025-01-01',
			'2025-01-07'
		);

		expect(result).toEqual({});
	});

	it('should handle timeout errors', async () => {
		vi.mocked(fetcher.fetchJson).mockRejectedValue(
			new Error('Request timed out')
		);

		const result = await getPrecip(
			39.0458,
			-76.6413,
			'2025-01-01',
			'2025-01-07'
		);

		expect(result).toEqual({});
	});

	it('should handle HTTP 429 rate limiting', async () => {
		vi.mocked(fetcher.fetchJson).mockRejectedValue(
			new Error('HTTP 429: Rate limit exceeded')
		);

		const result = await getPrecip(
			39.0458,
			-76.6413,
			'2025-01-01',
			'2025-01-07'
		);

		expect(result).toEqual({});
	});
});
