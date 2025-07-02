import { fromUrl } from 'geotiff';
import proj4 from 'proj4';

// Use proxy server to handle CORS for NOAA NWPS Stage IV precipitation data
const PROXY_BASE_URL = 'http://localhost:3001/api/noaa-precip';

// HRAP polar stereographic projection for NWPS Stage IV
const HRAP_PROJ =
	'+proj=stere +lat_0=90 +lat_ts=60 +lon_0=-105 +k=1 +x_0=0 +y_0=0 +a=6371200 +b=6371200 +units=m +no_defs';

function buildUrl(date: string): string {
	// date is YYYY-MM-DD; NWPS Stage IV naming convention:
	// https://water.noaa.gov/resources/downloads/precip/stageIV/YYYY/MM/DD/nws_precip_1day_YYYYMMDD_conus.tif
	const [year, month, day] = date.split('-');
	const yyyymmdd = date.replace(/-/g, '');
	return `${PROXY_BASE_URL}/${year}/${month}/${day}/nws_precip_1day_${yyyymmdd}_conus.tif`;
}

// Sample multiple grid cells around the target location to get better precipitation estimates
async function sampleNearbyGridCells(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	image: any,
	centerX: number,
	centerY: number,
	width: number,
	height: number,
	date: string
): Promise<{
	values: number[];
	stats: { min: number; max: number; avg: number; count: number };
}> {
	const values: number[] = [];
	const radius = 2; // Sample 5x5 grid around center point

	console.log(
		`[NWPS] ${date}: Sampling ${radius * 2 + 1}x${radius * 2 + 1} grid around center (${centerX}, ${centerY})`
	);

	for (let dy = -radius; dy <= radius; dy++) {
		for (let dx = -radius; dx <= radius; dx++) {
			const x = centerX + dx;
			const y = centerY + dy;

			// Check bounds
			if (x < 0 || x >= width || y < 0 || y >= height) {
				continue;
			}

			try {
				const window = [x, y, x + 1, y + 1] as [
					number,
					number,
					number,
					number,
				];
				const raster = (await image.readRasters({ window })) as {
					[key: number]: Float32Array;
				};
				const value = raster[0][0];

				// Only include valid values (not nodata)
				if (value !== undefined && value !== null && value >= -1000) {
					values.push(value);
					if (value > 0) {
						console.log(
							`[NWPS] ${date}: Grid cell (${x}, ${y}): ${value} inches`
						);
					}
				}
			} catch {
				// Skip cells that can't be read
				continue;
			}
		}
	}

	if (values.length === 0) {
		return { values: [], stats: { min: 0, max: 0, avg: 0, count: 0 } };
	}

	const min = Math.min(...values);
	const max = Math.max(...values);
	const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
	const count = values.length;

	console.log(
		`[NWPS] ${date}: Grid sampling stats - Min: ${min}, Max: ${max}, Avg: ${avg.toFixed(4)}, Valid cells: ${count}`
	);

	return { values, stats: { min, max, avg, count } };
}

export async function fetchNwpsPixel(
	lat: number,
	lon: number,
	dates: string[]
): Promise<Record<string, number>> {
	console.log(
		`[NWPS] Fetching pixel data for ${lat}, ${lon} for dates: ${dates.join(', ')}`
	);

	const result: Record<string, number> = {};
	let successCount = 0;
	let errorCount = 0;

	for (const d of dates) {
		const url = buildUrl(d);
		console.log(`[NWPS] Processing date ${d}: ${url}`);

		try {
			const tiff = await fromUrl(url);
			const image = await tiff.getImage();
			const bbox = image.getBoundingBox(); // [minX,minY,maxX,maxY] in projected coords
			const width = image.getWidth();
			const height = image.getHeight();

			console.log(
				`[NWPS] ${d}: Image dimensions ${width}x${height}, bbox [${bbox.join(', ')}]`
			);

			// Convert lat/lon to projected coordinates (EPSG:4326 -> HRAP polar stereographic)
			const [projLon, projLat] = proj4('EPSG:4326', HRAP_PROJ, [
				lon,
				lat,
			]);

			console.log(
				`[NWPS] ${d}: Projected coordinates (${projLon}, ${projLat})`
			);

			// Convert projected coordinates to pixel coordinates
			const x = Math.floor(
				((projLon - bbox[0]) / (bbox[2] - bbox[0])) * width
			);
			const y = Math.floor(
				((bbox[3] - projLat) / (bbox[3] - bbox[1])) * height
			);

			console.log(`[NWPS] ${d}: Center pixel coordinates (${x}, ${y})`);

			// Ensure center coordinates are within bounds
			if (x < 0 || x >= width || y < 0 || y >= height) {
				console.warn(
					`[NWPS] ${d}: Center coordinates out of bounds - lat=${lat}, lon=${lon}, x=${x}, y=${y}, bounds=[0,0,${width},${height}]`
				);
				console.warn(
					`[NWPS] ${d}: This location may be outside NWPS coverage area`
				);
				result[d] = 0;
				continue;
			}

			// Sample the center pixel first
			const centerWindow = [x, y, x + 1, y + 1] as [
				number,
				number,
				number,
				number,
			];
			const centerRaster = (await image.readRasters({
				window: centerWindow,
			})) as {
				[key: number]: Float32Array;
			};
			const centerValue = centerRaster[0][0];

			console.log(
				`[NWPS] ${d}: Center pixel value: ${centerValue} (type: ${typeof centerValue})`
			);

			// Sample nearby grid cells for comparison
			const gridSample = await sampleNearbyGridCells(
				image,
				x,
				y,
				width,
				height,
				d
			);

			// Choose the best value to use
			let finalValue = centerValue || 0;

			// If center pixel is zero or nodata, but nearby cells have precipitation, use the maximum nearby value
			if (
				(centerValue === undefined ||
					centerValue === null ||
					centerValue < -1000 ||
					centerValue === 0) &&
				gridSample.stats.max > 0
			) {
				finalValue = gridSample.stats.max;
				console.log(
					`[NWPS] ${d}: Using nearby maximum value ${finalValue} instead of center value ${centerValue}`
				);
			}
			// If center pixel has data, but nearby cells have significantly higher values, average them
			else if (
				centerValue > 0 &&
				gridSample.stats.max > centerValue * 1.5
			) {
				finalValue = Math.max(centerValue, gridSample.stats.avg);
				console.log(
					`[NWPS] ${d}: Using enhanced value ${finalValue} (center: ${centerValue}, nearby avg: ${gridSample.stats.avg.toFixed(4)})`
				);
			}

			// Check for nodata values in final result
			if (
				finalValue === undefined ||
				finalValue === null ||
				finalValue < -1000
			) {
				console.warn(`[NWPS] ${d}: NoData value detected, using 0`);
				finalValue = 0;
			}

			result[d] = finalValue;
			successCount++;

			if (finalValue > 0) {
				console.log(
					`[NWPS] ${d}: ✅ Final precipitation: ${finalValue} inches`
				);
			} else {
				console.log(
					`[NWPS] ${d}: ⚠️  Zero precipitation (could be valid - no rain detected in area)`
				);
			}
		} catch (err) {
			console.error(`[NWPS] ${d}: Fetch error for ${url}:`, err);
			errorCount++;
			// Don't throw - just set to 0 and continue with other dates
			result[d] = 0;
		}
	}

	console.log(
		`[NWPS] Summary: ${successCount} successful, ${errorCount} errors out of ${dates.length} dates`
	);

	if (errorCount === dates.length) {
		throw new Error(
			`[NWPS] All ${dates.length} date requests failed. Check proxy server and network connectivity.`
		);
	}

	return result;
}
