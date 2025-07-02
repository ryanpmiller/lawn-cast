import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getObservedPrecip } from '../api/observedPrecip';
import * as nwps from '../api/nwps';
import * as ghcnd from '../api/ghcnd';

// Mock the API modules
vi.mock('../api/nwps');
vi.mock('../api/ghcnd');

// Mock localStorage
const mockLocalStorage = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
	value: mockLocalStorage,
});

describe('getObservedPrecip', () => {
	const mockLat = 39.0458;
	const mockLon = -76.6413;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2025-01-07T12:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should return cached data when valid cache exists', async () => {
		const cachedData = {
			'2025-01-01': { amount: 0.5, pop: 1 },
			'2025-01-02': { amount: 0.3, pop: 1 },
		};
		const cacheEntry = {
			ts: Date.now() - 1000, // 1 second ago
			data: cachedData,
			lat: mockLat,
			lon: mockLon,
		};

		mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cacheEntry));

		const result = await getObservedPrecip(mockLat, mockLon);

		expect(result).toEqual(cachedData);
		expect(vi.mocked(nwps.fetchNwpsPixel)).not.toHaveBeenCalled();
		expect(vi.mocked(ghcnd.fetchGHCNDPrecip)).not.toHaveBeenCalled();
	});

	it('should fetch from NWPS when cache is expired', async () => {
		const expiredCacheEntry = {
			ts: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
			data: {},
		};
		mockLocalStorage.getItem.mockReturnValue(
			JSON.stringify(expiredCacheEntry)
		);

		const mockNwpsData = {
			'2024-12-31': 0.4,
			'2025-01-01': 0.5,
			'2025-01-02': 0.3,
			'2025-01-03': 0.0,
			'2025-01-04': 0.2,
			'2025-01-05': 0.1,
			'2025-01-06': 0.0,
		};
		vi.mocked(nwps.fetchNwpsPixel).mockResolvedValue(mockNwpsData);

		const result = await getObservedPrecip(mockLat, mockLon);

		expect(vi.mocked(nwps.fetchNwpsPixel)).toHaveBeenCalledWith(
			mockLat,
			mockLon,
			[
				'2024-12-31',
				'2025-01-01',
				'2025-01-02',
				'2025-01-03',
				'2025-01-04',
				'2025-01-05',
				'2025-01-06',
			]
		);

		expect(result).toEqual({
			'2024-12-31': { amount: 0.4, pop: 1 },
			'2025-01-01': { amount: 0.5, pop: 1 },
			'2025-01-02': { amount: 0.3, pop: 1 },
			'2025-01-03': { amount: 0.0, pop: 1 },
			'2025-01-04': { amount: 0.2, pop: 1 },
			'2025-01-05': { amount: 0.1, pop: 1 },
			'2025-01-06': { amount: 0.0, pop: 1 },
		});

		expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
			'observedPrecip_v2_39.046_-76.641',
			expect.stringContaining('"ts":')
		);
	});

	it('should fallback to GHCND when NWPS fails', async () => {
		mockLocalStorage.getItem.mockReturnValue(null);

		// NWPS fails
		vi.mocked(nwps.fetchNwpsPixel).mockRejectedValue(
			new Error('NWPS API error')
		);

		// GHCND succeeds
		const mockGhcndData = {
			'2024-12-31': 0.3,
			'2025-01-01': 0.4,
			'2025-01-02': 0.2,
			'2025-01-03': 0.0,
			'2025-01-04': 0.1,
			'2025-01-05': 0.0,
			'2025-01-06': 0.0,
		};
		vi.mocked(ghcnd.fetchGHCNDPrecip).mockResolvedValue(mockGhcndData);

		const result = await getObservedPrecip(mockLat, mockLon);

		expect(vi.mocked(nwps.fetchNwpsPixel)).toHaveBeenCalled();
		expect(vi.mocked(ghcnd.fetchGHCNDPrecip)).toHaveBeenCalledWith(
			mockLat,
			mockLon,
			'2024-12-31', // start date
			[
				'2024-12-31',
				'2025-01-01',
				'2025-01-02',
				'2025-01-03',
				'2025-01-04',
				'2025-01-05',
				'2025-01-06',
			]
		);

		expect(result).toEqual({
			'2024-12-31': { amount: 0.3, pop: 1 },
			'2025-01-01': { amount: 0.4, pop: 1 },
			'2025-01-02': { amount: 0.2, pop: 1 },
			'2025-01-03': { amount: 0.0, pop: 1 },
			'2025-01-04': { amount: 0.1, pop: 1 },
			'2025-01-05': { amount: 0.0, pop: 1 },
			'2025-01-06': { amount: 0.0, pop: 1 },
		});
	});

	it('should return zero values when both APIs fail', async () => {
		mockLocalStorage.getItem.mockReturnValue(null);

		// Both APIs fail
		vi.mocked(nwps.fetchNwpsPixel).mockRejectedValue(
			new Error('NWPS API error')
		);
		vi.mocked(ghcnd.fetchGHCNDPrecip).mockRejectedValue(
			new Error('GHCND API error')
		);

		const result = await getObservedPrecip(mockLat, mockLon);

		expect(vi.mocked(nwps.fetchNwpsPixel)).toHaveBeenCalled();
		expect(vi.mocked(ghcnd.fetchGHCNDPrecip)).toHaveBeenCalled();

		// Should return zero values for all dates
		const expectedResult = {
			'2024-12-31': { amount: 0, pop: 1 },
			'2025-01-01': { amount: 0, pop: 1 },
			'2025-01-02': { amount: 0, pop: 1 },
			'2025-01-03': { amount: 0, pop: 1 },
			'2025-01-04': { amount: 0, pop: 1 },
			'2025-01-05': { amount: 0, pop: 1 },
			'2025-01-06': { amount: 0, pop: 1 },
		};

		expect(result).toEqual(expectedResult);

		// Should still cache the zero values (with shorter TTL)
		expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
			'observedPrecip_v2_39.046_-76.641',
			expect.stringContaining('"ts":')
		);
	});

	it('should handle corrupted cache gracefully', async () => {
		mockLocalStorage.getItem.mockReturnValue('invalid json');

		const mockNwpsData = {
			'2024-12-31': 0.4,
			'2025-01-01': 0.5,
			'2025-01-02': 0.3,
			'2025-01-03': 0.0,
			'2025-01-04': 0.2,
			'2025-01-05': 0.1,
			'2025-01-06': 0.0,
		};
		vi.mocked(nwps.fetchNwpsPixel).mockResolvedValue(mockNwpsData);

		const result = await getObservedPrecip(mockLat, mockLon);

		// Should ignore corrupted cache and fetch fresh data
		expect(vi.mocked(nwps.fetchNwpsPixel)).toHaveBeenCalled();
		expect(result).toBeDefined();
	});

	it('should handle missing cache gracefully', async () => {
		mockLocalStorage.getItem.mockReturnValue(null);

		const mockNwpsData = {
			'2024-12-31': 0.4,
			'2025-01-01': 0.5,
			'2025-01-02': 0.3,
			'2025-01-03': 0.0,
			'2025-01-04': 0.2,
			'2025-01-05': 0.1,
			'2025-01-06': 0.0,
		};
		vi.mocked(nwps.fetchNwpsPixel).mockResolvedValue(mockNwpsData);

		const result = await getObservedPrecip(mockLat, mockLon);

		expect(vi.mocked(nwps.fetchNwpsPixel)).toHaveBeenCalled();
		expect(result).toBeDefined();
	});

	it('should handle partial NWPS data correctly', async () => {
		mockLocalStorage.getItem.mockReturnValue(null);

		// NWPS returns partial data (some dates missing)
		const mockNwpsData = {
			'2025-01-01': 0.5,
			'2025-01-03': 0.2,
			// Missing 2024-12-31, 2025-01-02, 2025-01-04, etc.
		};
		vi.mocked(nwps.fetchNwpsPixel).mockResolvedValue(mockNwpsData);

		const result = await getObservedPrecip(mockLat, mockLon);

		expect(result).toEqual({
			'2024-12-31': { amount: 0, pop: 1 }, // Missing data becomes 0
			'2025-01-01': { amount: 0.5, pop: 1 },
			'2025-01-02': { amount: 0, pop: 1 }, // Missing data becomes 0
			'2025-01-03': { amount: 0.2, pop: 1 },
			'2025-01-04': { amount: 0, pop: 1 }, // Missing data becomes 0
			'2025-01-05': { amount: 0, pop: 1 },
			'2025-01-06': { amount: 0, pop: 1 },
		});
	});
});
