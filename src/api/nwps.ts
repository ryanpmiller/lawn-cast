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

export async function fetchNwpsPixel(
	lat: number,
	lon: number,
	dates: string[]
): Promise<Record<string, number>> {
	const result: Record<string, number> = {};
	for (const d of dates) {
		const url = buildUrl(d);
		try {
			const tiff = await fromUrl(url);
			const image = await tiff.getImage();
			const bbox = image.getBoundingBox(); // [minX,minY,maxX,maxY] in projected coords
			const width = image.getWidth();
			const height = image.getHeight();

			// Convert lat/lon to projected coordinates (EPSG:4326 -> HRAP polar stereographic)
			const [projLon, projLat] = proj4('EPSG:4326', HRAP_PROJ, [
				lon,
				lat,
			]);

			// Convert projected coordinates to pixel coordinates
			const x = Math.floor(
				((projLon - bbox[0]) / (bbox[2] - bbox[0])) * width
			);
			const y = Math.floor(
				((bbox[3] - projLat) / (bbox[3] - bbox[1])) * height
			);

			// Ensure coordinates are within bounds
			if (x < 0 || x >= width || y < 0 || y >= height) {
				console.warn(
					`NWPS coordinates out of bounds for ${d}: lat=${lat}, lon=${lon}, x=${x}, y=${y}`
				);
				result[d] = 0;
				continue;
			}

			const window = [x, y, x + 1, y + 1] as [
				number,
				number,
				number,
				number,
			];
			const raster = (await image.readRasters({ window })) as {
				[key: number]: Float32Array;
			};
			const valueInches = raster[0][0];

			// Check for nodata values (e.g., -9999)
			if (
				valueInches === undefined ||
				valueInches === null ||
				valueInches < -1000
			) {
				console.warn(`NWPS: NoData value at (${x},${y}) for ${d}`);
				result[d] = 0;
				continue;
			}

			// NWPS Stage IV data is already in inches (not hundredths)
			result[d] = valueInches || 0;
		} catch (err) {
			console.warn('NWPS fetch error', url, err);
			// Don't throw - just set to 0 and continue with other dates
			result[d] = 0;
		}
	}
	return result;
}
