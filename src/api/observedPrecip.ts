import { fetchNwpsPixel } from './nwps';
import { fetchGHCNDPrecip } from './ghcnd';
import { getPast7Dates, getStartDate } from './dateUtils';

const TTL = 60 * 60 * 1000; // 1 hour
const LS_KEY = 'observedPrecip_v1';

export interface ObservedDay {
	amount: number;
	pop: number; // set to 1 (100%) to fit existing type
}

export type ObservedMap = Record<string, ObservedDay>;

export async function getObservedPrecip(
	lat: number,
	lon: number
): Promise<ObservedMap> {
	const cachedRaw = localStorage.getItem(LS_KEY);
	if (cachedRaw) {
		try {
			const cached = JSON.parse(cachedRaw) as {
				ts: number;
				data: ObservedMap;
			};
			if (Date.now() - cached.ts < TTL) return cached.data;
		} catch {
			// ignore cache parse errors
		}
	}

	const dates = getPast7Dates();
	try {
		const nwps = await fetchNwpsPixel(lat, lon, dates);
		const mapped: ObservedMap = {};
		dates.forEach(d => {
			mapped[d] = { amount: nwps[d] || 0, pop: 1 };
		});
		localStorage.setItem(
			LS_KEY,
			JSON.stringify({ ts: Date.now(), data: mapped })
		);
		return mapped;
	} catch (err) {
		console.warn('NWPS failed, using GHCND fallback', err);
		const ghcnd = await fetchGHCNDPrecip(
			lat,
			lon,
			getStartDate(dates),
			dates
		);
		const mapped: ObservedMap = {};
		dates.forEach(d => {
			mapped[d] = { amount: ghcnd[d] || 0, pop: 1 };
		});
		localStorage.setItem(
			LS_KEY,
			JSON.stringify({ ts: Date.now(), data: mapped })
		);
		return mapped;
	}
}
