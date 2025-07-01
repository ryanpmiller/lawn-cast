import { useEffect, useState } from 'react';
import { useLawnCastStore } from '../models/store';
import { calculateDecision } from '../models/logic';
import type { CalculateDecisionResult } from '../models/logic';
import {
	Skeleton,
	Stack,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import DecisionCard from '../components/DecisionCard';
import StackedProgressBar from '../components/StackedProgressBar';
import ExplanationSection from '../components/ExplanationSection';
import PageLayout from '../components/PageLayout';
import { StyledPaper } from '../components/ui/StyledPaper';
import { getPrecip } from '../api/nws';
import { getObservedPrecip } from '../api/observedPrecip';
import { format, startOfWeek, endOfWeek, isBefore, parseISO } from 'date-fns';
import type { WeatherCache } from '../models/types';
import { calculateWaterAmounts } from '../utils/calculations';

// Weather cache helpers (moved from noaa.ts)
const ONE_HOUR_MS = 60 * 60 * 1000;
function getCachedWeatherData(): WeatherCache | null {
	const cache = useLawnCastStore.getState().cache;
	if (!cache) return null;
	if (Date.now() - cache.timestamp > ONE_HOUR_MS) return null;
	return cache;
}
function setWeatherCache(cache: WeatherCache) {
	useLawnCastStore.getState().setCache(cache);
}

export default function HomePage() {
	const [loading, setLoading] = useState(true);
	const [decision, setDecision] = useState<CalculateDecisionResult | null>(
		null
	);
	const settings = useLawnCastStore(s => s.settings);
	const entries = useLawnCastStore(s => s.entries);
	const cache = useLawnCastStore(s => s.cache);

	useEffect(() => {
		async function fetchWeatherIfNeeded() {
			if (!settings.lat || !settings.lon || !settings.zip) return;
			const cache = getCachedWeatherData();
			if (cache) return;
			setLoading(true);
			try {
				// Get week range (Sunday to Saturday)
				const now = new Date();
				const weekStart = format(
					startOfWeek(now, { weekStartsOn: 0 }),
					'yyyy-MM-dd'
				);
				const weekEnd = format(
					endOfWeek(now, { weekStartsOn: 0 }),
					'yyyy-MM-dd'
				);
				// Fetch NWS data for forecast (today and future)
				const nwsWeek = await getPrecip(
					settings.lat,
					settings.lon,
					weekStart,
					weekEnd
				);
				// Observed precip via NWPS/GHCND (past days only)
				const observedRaw = await getObservedPrecip(
					settings.lat,
					settings.lon
				);

				const todayStr = format(new Date(), 'yyyy-MM-dd');
				const observedInches: Record<
					string,
					{ amount: number; pop: number }
				> = {};
				const forecastInches: Record<
					string,
					{ amount: number; pop: number }
				> = {};

				// Add observed data (past days within current week only)
				for (const date in observedRaw) {
					const dateObj = new Date(date);
					const weekStartDate = new Date(weekStart);
					const todayDate = new Date(todayStr);

					// Only include dates that are:
					// 1. Within the current week (>= weekStart)
					// 2. Before today (past days only)
					if (
						dateObj >= weekStartDate &&
						isBefore(dateObj, todayDate)
					) {
						observedInches[date] = observedRaw[date];
					}
				}

				// Add forecast data (today and future days within current week only)
				for (const date in nwsWeek) {
					const dateObj = new Date(date);
					const weekEndDate = new Date(weekEnd);
					const todayDate = new Date(todayStr);

					// Only include dates that are:
					// 1. Today or future days (!isBefore(dateObj, todayDate))
					// 2. Within the current week (<= weekEnd)
					if (
						!isBefore(dateObj, todayDate) &&
						dateObj <= weekEndDate
					) {
						forecastInches[date] = nwsWeek[date];
					}
				}

				setWeatherCache({
					timestamp: Date.now(),
					observedInches,
					forecastInches,
				});
			} catch {
				// Optionally handle error (e.g., show a toast)
			} finally {
				setLoading(false);
			}
		}
		fetchWeatherIfNeeded();
		// Only run when lat/lon/zip change
	}, [settings.lat, settings.lon, settings.zip]);

	useEffect(() => {
		// Simulate async data prep
		setTimeout(() => {
			const { rainPast, rainForecast, loggedWater } =
				calculateWaterAmounts(
					cache,
					entries,
					settings.sprinklerRateInPerHr
				);
			const zone = settings.zone || 'cool';
			const sunExposure = settings.sunExposure || 'full';
			const result = calculateDecision({
				rainPast,
				rainForecast,
				loggedWater,
				zone,
				sunExposure,
			});
			setDecision(result);
			setLoading(false);
		}, 500);
	}, [cache, entries, settings]);

	return (
		<PageLayout title="Home" alignItems="center" titleAlign="center">
			<StyledPaper variant="card">
				{loading ? (
					<Skeleton
						variant="rectangular"
						height={120}
						animation="wave"
					/>
				) : (
					decision && (
						<DecisionCard
							decision={decision.decision}
							totalProjected={decision.totalProjected}
							weeklyTarget={decision.weeklyTarget}
						/>
					)
				)}
			</StyledPaper>
			<StyledPaper variant="progress">
				{loading ? (
					<Skeleton
						variant="rounded"
						height={24}
						width="100%"
						animation="wave"
					/>
				) : (
					decision && (
						<StackedProgressBar
							{...calculateWaterAmounts(
								cache,
								entries,
								settings.sprinklerRateInPerHr
							)}
							weeklyTarget={decision.weeklyTarget}
						/>
					)
				)}
			</StyledPaper>
			<StyledPaper variant="section">
				{loading ? (
					<Stack spacing={1}>
						<Skeleton width="60%" height={24} animation="wave" />
						<Skeleton width="80%" height={20} animation="wave" />
						<Skeleton width="40%" height={20} animation="wave" />
					</Stack>
				) : (
					decision && (
						<>
							<ExplanationSection
								decision={decision}
								{...calculateWaterAmounts(
									cache,
									entries,
									settings.sprinklerRateInPerHr
								)}
							/>
							{cache?.forecastInches &&
								Object.keys(cache.forecastInches).length >
									0 && (
									<Box sx={{ mt: 3 }}>
										<Typography
											variant="subtitle2"
											fontWeight={600}
											gutterBottom
										>
											Forecast Breakdown
										</Typography>
										<TableContainer>
											<Table
												size="small"
												aria-label="Forecast breakdown"
											>
												<TableHead>
													<TableRow>
														<TableCell>
															Day
														</TableCell>
														<TableCell align="right">
															Amount (in)
														</TableCell>
														<TableCell align="right">
															Probability
														</TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{Object.entries(
														cache.forecastInches
													).map(
														([
															date,
															{ amount, pop },
														]) => (
															<TableRow
																key={date}
																sx={
																	pop >= 0.6
																		? {
																				bgcolor:
																					'grey.500',
																				'& td': {
																					color: 'white',
																					fontWeight: 700,
																				},
																			}
																		: {}
																}
															>
																<TableCell>
																	{format(
																		parseISO(
																			date
																		),
																		'EEEE'
																	)}
																</TableCell>
																<TableCell align="right">
																	{amount.toFixed(
																		2
																	)}
																</TableCell>
																<TableCell align="right">
																	{Math.round(
																		pop *
																			100
																	)}
																	%
																</TableCell>
															</TableRow>
														)
													)}
												</TableBody>
											</Table>
										</TableContainer>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ mt: 1, display: 'block' }}
										>
											Highlighted rows are included in the
											forecast total (≥60% probability).
										</Typography>
									</Box>
								)}
						</>
					)
				)}
			</StyledPaper>
		</PageLayout>
	);
}
