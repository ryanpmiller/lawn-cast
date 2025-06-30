import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Middleware to log requests
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
	next();
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint for NOAA NWPS Stage IV precipitation data
app.use('/api/noaa-precip', async (req, res) => {
	try {
		// Extract the path after /api/noaa-precip
		const path = req.url.startsWith('/') ? req.url.slice(1) : req.url;

		// Only allow specific NOAA NWPS Stage IV endpoints for security
		const allowedPaths = [
			// Historical daily data: YYYY/MM/DD/nws_precip_1day_YYYYMMDD_conus.tif
			/^\d{4}\/\d{2}\/\d{2}\/nws_precip_1day_\d{8}_conus\.tif$/,
			// Current data endpoints
			/^current\/nws_precip_last24hours_conus\.tif$/,
			/^current\/nws_precip_last\d+hours_conus\.tif$/,
		];

		const isAllowed = allowedPaths.some(pattern => pattern.test(path));

		if (!isAllowed) {
			return res.status(403).json({
				error: 'Forbidden path',
				message:
					'Only NOAA NWPS Stage IV precipitation endpoints are allowed',
				requestedPath: path,
			});
		}

		// Construct the full NOAA URL
		const noaaUrl = `https://water.noaa.gov/resources/downloads/precip/stageIV/${path}`;

		console.log(`Proxying request to: ${noaaUrl}`);

		// Fetch from NOAA
		const response = await fetch(noaaUrl);

		if (!response.ok) {
			console.error(
				`NOAA API error: ${response.status} ${response.statusText}`
			);
			return res.status(response.status).json({
				error: 'NOAA API Error',
				status: response.status,
				statusText: response.statusText,
			});
		}

		// Forward the response headers
		res.set({
			'Content-Type': response.headers.get('content-type'),
			'Content-Length': response.headers.get('content-length'),
			'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
		});

		// Stream the response
		response.body.pipe(res);
	} catch (error) {
		console.error('Proxy error:', error);
		res.status(500).json({
			error: 'Internal Server Error',
			message: error.message,
		});
	}
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
	res.status(404).json({
		error: 'Not Found',
		message:
			'This proxy only supports NOAA NWPS precipitation data endpoints',
	});
});

// Error handling middleware
app.use((error, req, res, next) => {
	console.error('Unhandled error:', error);
	res.status(500).json({
		error: 'Internal Server Error',
		message: 'An unexpected error occurred',
	});
});

app.listen(PORT, () => {
	console.log(`NOAA NWPS Proxy Server running on port ${PORT}`);
	console.log(`Health check: http://localhost:${PORT}/health`);
	console.log(`Proxy endpoint: http://localhost:${PORT}/api/noaa-precip/`);
});

export default app;
