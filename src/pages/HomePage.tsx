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
import InlineOnboarding from '../components/InlineOnboarding';
import { getPrecip } from '../api/nws';
import { getObservedPrecip } from '../api/observedPrecip';
import { format, startOfWeek, endOfWeek, isBefore } from 'date-fns';
import type { WeatherCache } from '../models/types';
import { calculateWaterAmounts } from '../utils/calculations';
import { formatDayName } from '../utils/dateUtils';

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
		// Clear weather cache when location changes to ensure fresh data for new location
		if (settings.lat && settings.lon && settings.zip) {
			const cache = useLawnCastStore.getState().cache;
			if (cache) {
				// Clear the weather cache to force fresh data fetch for new location
				useLawnCastStore.getState().setCache(null);
			}
			// Note: observed precipitation cache now uses location-specific keys,
			// so no need to manually clear it - different locations will have different cache keys
		}
	}, [settings.lat, settings.lon, settings.zip]);

	useEffect(() => {
		async function fetchWeatherAndCalculateDecision() {
			// Early return if location not set
			if (!settings.lat || !settings.lon || !settings.zip) {
				setLoading(false);
				return;
			}

			setLoading(true);

			try {
				// Check if we have valid cached weather data
				const existingCache = getCachedWeatherData();
				if (!existingCache) {
					// Fetch fresh weather data
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
				}

				// Calculate decision with current cache (either existing or newly fetched)
				const currentCache = getCachedWeatherData();
				const { rainPast, rainForecast, loggedWater } =
					calculateWaterAmounts(
						currentCache || {
							timestamp: Date.now(),
							observedInches: {},
							forecastInches: {},
						},
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
			} catch (error) {
				console.error(
					'Error in weather fetch and decision calculation:',
					error
				);
				// Optionally handle error (e.g., show a toast)
			} finally {
				setLoading(false);
			}
		}

		fetchWeatherAndCalculateDecision();
	}, [
		settings.lat,
		settings.lon,
		settings.zip,
		entries,
		settings.sprinklerRateInPerHr,
		settings.zone,
		settings.sunExposure,
	]);

	return (
		<PageLayout title="Home" alignItems="center" titleAlign="center">
			{!settings.onboardingComplete ? (
				<InlineOnboarding />
			) : (
				<>
					<StyledPaper variant="card">
						{loading ? (
							<Skeleton
								variant="rectangular"
								height={240}
								animation="wave"
								sx={{ borderRadius: 3 }}
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
								height={36}
								width="100%"
								animation="wave"
								sx={{ borderRadius: 3 }}
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
							<Box sx={{ p: { xs: 2, sm: 3 } }}>
								{/* Title skeleton */}
								<Skeleton
									width="60%"
									height={28}
									animation="wave"
									sx={{ mb: 1 }}
								/>

								{/* Description skeleton */}
								<Skeleton
									width="100%"
									height={20}
									animation="wave"
									sx={{ mb: 0.5 }}
								/>
								<Skeleton
									width="100%"
									height={20}
									animation="wave"
									sx={{ mb: 0.5 }}
								/>
								<Skeleton
									width="25%"
									height={20}
									animation="wave"
									sx={{ mb: 2 }}
								/>

								{/* Breakdown cards skeleton */}
								<Stack
									direction="row"
									spacing={2}
									justifyContent="space-between"
									sx={{ mb: 2 }}
								>
									{[1, 2, 3].map(i => (
										<Stack
											key={i}
											alignItems="center"
											spacing={0.5}
											minWidth={72}
										>
											<Skeleton
												width={48}
												height={16}
												animation="wave"
											/>
											<Skeleton
												variant="rounded"
												width={70}
												height={40}
												animation="wave"
												sx={{ borderRadius: 2 }}
											/>
										</Stack>
									))}
								</Stack>

								{/* Footer text skeleton */}
								<Skeleton
									width="70%"
									height={16}
									animation="wave"
								/>
							</Box>
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
										Object.keys(cache.forecastInches)
											.length > 0 && (
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
																	{
																		amount,
																		pop,
																	},
																]) => (
																	<TableRow
																		key={
																			date
																		}
																		sx={
																			pop >=
																			0.6
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
																			{formatDayName(
																				date
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
													sx={{
														mt: 1,
														mb: 1,
														display: 'block',
													}}
												>
													Highlighted rows are
													included in the forecast
													total (≥60% probability).
												</Typography>
											</Box>
										)}
								</>
							)
						)}
					</StyledPaper>
				</>
			)}
		</PageLayout>
	);
}
