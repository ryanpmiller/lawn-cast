import { fetchNwpsPixel } from './nwps';
import { fetchGHCNDPrecip } from './ghcnd';
import { getPast7Dates, getStartDate } from './dateUtils';

const TTL = 60 * 60 * 1000; // 1 hour
const LS_KEY_PREFIX = 'observedPrecip_v2'; // Updated version to include location

export interface ObservedDay {
	amount: number;
	pop: number; // set to 1 (100%) to fit existing type
}

export type ObservedMap = Record<string, ObservedDay>;

// Generate location-specific cache key
function getCacheKey(lat: number, lon: number): string {
	// Round to 3 decimal places (~100m precision) to avoid cache misses from tiny coordinate differences
	const roundedLat = Math.round(lat * 1000) / 1000;
	const roundedLon = Math.round(lon * 1000) / 1000;
	return `${LS_KEY_PREFIX}_${roundedLat}_${roundedLon}`;
}

export async function getObservedPrecip(
	lat: number,
	lon: number
): Promise<ObservedMap> {
	const cacheKey = getCacheKey(lat, lon);
	console.log(`[ObservedPrecip] Fetching data for location: ${lat}, ${lon}`);
	console.log(`[ObservedPrecip] Cache key: ${cacheKey}`);

	const cachedRaw = localStorage.getItem(cacheKey);
	if (cachedRaw) {
		try {
			const cached = JSON.parse(cachedRaw) as {
				ts: number;
				data: ObservedMap;
				lat: number;
				lon: number;
			};
			const cacheAge = Date.now() - cached.ts;
			const cacheAgeHours = cacheAge / (60 * 60 * 1000);

			console.log(
				`[ObservedPrecip] Found cached data from ${cacheAgeHours.toFixed(1)} hours ago`
			);

			if (cacheAge < TTL) {
				console.log(
					'[ObservedPrecip] ✅ Using cached data (within 1-hour TTL)'
				);
				return cached.data;
			} else {
				console.log(
					'[ObservedPrecip] ⏰ Cache expired, fetching fresh data'
				);
			}
		} catch (error) {
			console.warn(
				'[ObservedPrecip] ⚠️ Cache parse error, fetching fresh data:',
				error
			);
		}
	} else {
		console.log(
			'[ObservedPrecip] 🆕 No cached data found, fetching fresh data'
		);
	}

	const dates = getPast7Dates();
	console.log(
		`[ObservedPrecip] Fetching data for dates: ${dates.join(', ')}`
	);

	// Try NWPS first
	try {
		console.log(
			'[ObservedPrecip] Attempting NWPS (Stage IV) data fetch...'
		);
		const nwps = await fetchNwpsPixel(lat, lon, dates);
		console.log('[ObservedPrecip] NWPS data received:', nwps);

		const mapped: ObservedMap = {};
		let totalPrecip = 0;
		dates.forEach(d => {
			const amount = nwps[d] || 0;
			mapped[d] = { amount, pop: 1 };
			totalPrecip += amount;
		});

		console.log(
			`[ObservedPrecip] NWPS total precipitation: ${totalPrecip} inches`
		);

		if (totalPrecip === 0) {
			console.warn(
				'[ObservedPrecip] NWPS returned all zeros - this could indicate:'
			);
			console.warn(
				'  1. No precipitation in this area during the time period'
			);
			console.warn('  2. Location outside NWPS coverage area');
			console.warn('  3. Data processing issues at NOAA');
			console.warn('  4. Projection/coordinate conversion issues');
		}

		// Store with location info for debugging
		const cacheData = {
			ts: Date.now(),
			data: mapped,
			lat,
			lon,
		};
		localStorage.setItem(cacheKey, JSON.stringify(cacheData));
		console.log(
			`[ObservedPrecip] 💾 Cached data for 1 hour at key: ${cacheKey}`
		);
		return mapped;
	} catch (err) {
		console.warn(
			'[ObservedPrecip] NWPS failed, attempting GHCND fallback. Error:',
			err
		);

		// Try GHCND fallback
		try {
			console.log('[ObservedPrecip] Attempting GHCND fallback...');
			const ghcnd = await fetchGHCNDPrecip(
				lat,
				lon,
				getStartDate(dates),
				dates
			);
			console.log('[ObservedPrecip] GHCND data received:', ghcnd);

			const mapped: ObservedMap = {};
			let totalPrecip = 0;
			dates.forEach(d => {
				const amount = ghcnd[d] || 0;
				mapped[d] = { amount, pop: 1 };
				totalPrecip += amount;
			});

			console.log(
				`[ObservedPrecip] GHCND total precipitation: ${totalPrecip} inches`
			);

			// Store with location info for debugging
			const cacheData = {
				ts: Date.now(),
				data: mapped,
				lat,
				lon,
			};
			localStorage.setItem(cacheKey, JSON.stringify(cacheData));
			console.log(
				`[ObservedPrecip] 💾 Cached GHCND data for 1 hour at key: ${cacheKey}`
			);
			return mapped;
		} catch (ghcndErr) {
			console.error(
				'[ObservedPrecip] Both NWPS and GHCND APIs failed. NWPS error:',
				err
			);
			console.error('[ObservedPrecip] GHCND error:', ghcndErr);
			console.warn(
				'[ObservedPrecip] Returning zero values for all dates. This could indicate:'
			);
			console.warn('  1. Network connectivity issues');
			console.warn('  2. NOAA service outages');
			console.warn('  3. Location outside data coverage areas');
			console.warn('  4. API authentication issues (GHCND)');

			// Both APIs failed, return zero values for all dates
			const mapped: ObservedMap = {};
			dates.forEach(d => {
				mapped[d] = { amount: 0, pop: 1 };
			});

			// Cache the zero values with a shorter TTL (5 minutes) so we retry sooner
			const cacheData = {
				ts: Date.now(),
				data: mapped,
				lat,
				lon,
			};
			localStorage.setItem(cacheKey, JSON.stringify(cacheData));
			console.log(
				`[ObservedPrecip] 💾 Cached zero values (5 min TTL) at key: ${cacheKey}`
			);
			return mapped;
		}
	}
}
