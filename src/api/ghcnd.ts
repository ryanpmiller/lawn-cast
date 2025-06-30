import { fetchJson } from './fetcher';
import { getDistance } from 'geolib';

const BASE = 'https://www.ncei.noaa.gov/cdo-web/api/v2';
const TOKEN = import.meta.env.VITE_NCEI_TOKEN || '';

interface Station {
	id: string;
	latitude: number;
	longitude: number;
}

interface DataRecord {
	date: string;
	value: number; // hundredths of inch
}

async function apiGet<T>(endpoint: string): Promise<T> {
	if (!TOKEN) throw new Error('NCEI token missing (VITE_NCEI_TOKEN)');
	return fetchJson<T>(endpoint, { headers: { token: TOKEN } });
}

export async function fetchGHCNDPrecip(
	lat: number,
	lon: number,
	startDate: string, // YYYY-MM-DD (oldest date we need)
	dates: string[]
): Promise<Record<string, number>> {
	// 1. Find stations within 30 km
	const stationUrl = `${BASE}/stations?datasetid=GHCND&datatypeid=PRCP&limit=100&radius=30&units=standard&latitude=${lat}&longitude=${lon}`;
	const stnResp = await apiGet<{ results: Station[] }>(stationUrl);
	if (!stnResp.results?.length) throw new Error('No GHCND stations nearby');
	const sorted = stnResp.results
		.map(s => ({
			...s,
			dist: getDistance(
				{ latitude: lat, longitude: lon },
				{ latitude: s.latitude, longitude: s.longitude }
			),
		}))
		.sort((a, b) => a.dist - b.dist)
		.slice(0, 2);

	const daily: Record<string, number[]> = {};
	for (const stn of sorted) {
		const dataUrl = `${BASE}/data?datasetid=GHCND&stationid=${stn.id}&datatypeid=PRCP&units=standard&startdate=${startDate}&limit=500`;
		const dataResp = await apiGet<{ results: DataRecord[] }>(dataUrl);
		dataResp.results?.forEach(rec => {
			const day = rec.date.slice(0, 10);
			daily[day] = daily[day] || [];
			daily[day].push(rec.value / 100); // convert to inches
		});
	}
	const merged: Record<string, number> = {};
	dates.forEach(d => {
		merged[d] = daily[d]?.[0] ?? daily[d]?.[1] ?? 0;
	});
	return merged;
}
