import { fetchJson } from './fetcher';

const NOMINATIM_URL =
	import.meta.env.VITE_NOMINATIM_URL || 'https://nominatim.openstreetmap.org';

export interface NominatimResult {
	display_name: string;
	lat: string;
	lon: string;
	address: {
		postcode?: string;
		city?: string;
		state?: string;
		country?: string;
	};
}

let lastRequestTime = 0;
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingPromise: Promise<NominatimResult[]> | null = null;

export function searchZipAutocomplete(
	query: string,
	debounceMs = 300
): Promise<NominatimResult[]> {
	if (debounceTimeout) clearTimeout(debounceTimeout);
	if (pendingPromise) {
		// Cancel previous pending promise (not possible with fetch, but we can ignore its result)
		pendingPromise = null;
	}
	return new Promise((resolve, reject) => {
		debounceTimeout = setTimeout(async () => {
			const now = Date.now();
			const sinceLast = now - lastRequestTime;
			if (sinceLast < 1000) {
				await new Promise(r => setTimeout(r, 1000 - sinceLast));
			}
			lastRequestTime = Date.now();
			try {
				const url = `${NOMINATIM_URL}/search?format=json&addressdetails=1&limit=5&countrycodes=us&q=${encodeURIComponent(query)}`;
				const results = await fetchJson<NominatimResult[]>(url, {
					headers: {
						'User-Agent': 'lawncast-dev@example.com (LawnCast)',
					},
				});
				resolve(results);
			} catch (err) {
				reject(err);
			}
		}, debounceMs);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		pendingPromise = debounceTimeout as any as Promise<NominatimResult[]>;
	});
}
