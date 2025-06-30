import { fetchJson } from './fetcher';

interface NWSPointResponse {
	properties: {
		gridId: string;
		gridX: number;
		gridY: number;
		forecast: string;
		forecastHourly: string;
		forecastGridData: string;
	};
}

interface NWSGridDataResponse {
	properties: {
		probabilityOfPrecipitation?: {
			values: Array<{
				validTime: string;
				value: number | null;
			}>;
		};
		quantitativePrecipitation?: {
			values: Array<{
				validTime: string;
				value: number | null;
			}>;
		};
	};
}

/**
 * Parse ISO 8601 time interval to get start time and duration
 */
function parseTimeInterval(validTime: string): { start: Date; end: Date } {
	const [startStr, durationStr] = validTime.split('/');
	const start = new Date(startStr);

	// Parse duration (e.g., "PT6H" = 6 hours)
	let durationHours = 1; // default
	if (durationStr) {
		const match = durationStr.match(/PT(\d+)H/);
		if (match) {
			durationHours = parseInt(match[1]);
		}
	}

	const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
	return { start, end };
}

/**
 * Check if two time intervals overlap
 */
function timeIntervalsOverlap(time1: string, time2: string): boolean {
	const interval1 = parseTimeInterval(time1);
	const interval2 = parseTimeInterval(time2);

	return interval1.start < interval2.end && interval2.start < interval1.end;
}

/**
 * Fetch daily precipitation (inches) and PoP (0-1) for a given lat/lon and date range from NWS API.
 * Returns a record of { 'YYYY-MM-DD': { amount: number, pop: number } }
 */
export async function getPrecip(
	lat: number,
	lon: number,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_startDate: string, // YYYY-MM-DD (not used directly, but kept for interface compatibility)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_endDate: string // YYYY-MM-DD (not used directly, but kept for interface compatibility)
): Promise<Record<string, { amount: number; pop: number }>> {
	try {
		// Step 1: Get the grid coordinates for this location
		const pointUrl = `https://api.weather.gov/points/${lat},${lon}`;
		const pointData = await fetchJson<NWSPointResponse>(pointUrl, {
			headers: {
				'User-Agent': '(LawnCast Weather App, contact@lawncast.com)',
			},
		});

		// Step 2: Get the gridpoint data for detailed precipitation data
		const gridDataUrl = pointData.properties.forecastGridData;
		const gridData = await fetchJson<NWSGridDataResponse>(gridDataUrl, {
			headers: {
				'User-Agent': '(LawnCast Weather App, contact@lawncast.com)',
			},
		});

		// Step 3: Process gridpoint data into daily aggregations
		const result: Record<string, { amount: number; pop: number }> = {};
		const dailyData: Record<
			string,
			{
				amounts: number[];
				pops: number[];
				precipTimes: string[];
				popTimes: string[];
			}
		> = {};

		// Process precipitation data
		const precipValues =
			gridData.properties.quantitativePrecipitation?.values || [];
		const popValues =
			gridData.properties.probabilityOfPrecipitation?.values || [];

		// Group precipitation data by date
		for (const precipData of precipValues) {
			if (precipData.value === null) continue;

			// Parse the ISO 8601 time interval (e.g., "2025-01-01T12:00:00+00:00/PT6H")
			const timeStart = precipData.validTime.split('/')[0];
			const date = new Date(timeStart).toISOString().slice(0, 10);

			if (!dailyData[date]) {
				dailyData[date] = {
					amounts: [],
					pops: [],
					precipTimes: [],
					popTimes: [],
				};
			}

			// Extract precipitation amount (NWS gridpoint provides in mm, convert to inches)
			const precipMm = precipData.value;
			const precipInches = precipMm / 25.4;

			dailyData[date].amounts.push(precipInches);
			dailyData[date].precipTimes.push(precipData.validTime);
		}

		// Group PoP data by date and find best matches for precipitation times
		for (const popData of popValues) {
			if (popData.value === null) continue;

			const timeStart = popData.validTime.split('/')[0];
			const date = new Date(timeStart).toISOString().slice(0, 10);

			if (!dailyData[date]) {
				dailyData[date] = {
					amounts: [],
					pops: [],
					precipTimes: [],
					popTimes: [],
				};
			}

			dailyData[date].pops.push(popData.value / 100); // Convert percentage to 0-1
			dailyData[date].popTimes.push(popData.validTime);
		}

		// Aggregate daily data with improved PoP matching
		for (const [date, data] of Object.entries(dailyData)) {
			// Sum all precipitation amounts for the day
			const totalAmount = data.amounts.reduce(
				(sum, amount) => sum + amount,
				0
			);

			// Calculate PoP more intelligently
			let finalPop = 0;

			if (data.pops.length > 0) {
				if (totalAmount > 0) {
					// If there's precipitation, find PoP values that overlap with precipitation times
					const relevantPops: number[] = [];

					for (const precipTime of data.precipTimes) {
						for (let i = 0; i < data.popTimes.length; i++) {
							if (
								timeIntervalsOverlap(
									precipTime,
									data.popTimes[i]
								)
							) {
								relevantPops.push(data.pops[i]);
							}
						}
					}

					// Use max of relevant PoPs, or max of all PoPs if no overlap found
					finalPop =
						relevantPops.length > 0
							? Math.max(...relevantPops)
							: Math.max(...data.pops);
				} else {
					// If no precipitation, use max PoP for the day
					finalPop = Math.max(...data.pops);
				}
			}

			result[date] = {
				amount: totalAmount,
				pop: finalPop,
			};
		}

		return result;
	} catch (error) {
		console.error('Error fetching NWS precipitation data:', error);
		// Return empty object on error to maintain interface compatibility
		return {};
	}
}
