import { Box, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export interface StackedProgressBarProps {
	rainPast: number;
	rainForecast: number;
	loggedWater: number;
	weeklyTarget: number;
}

interface BarProps {
	rain: number;
	forecast: number;
	logged: number;
	theme: Theme;
	rainIn: number;
	forecastIn: number;
	loggedIn: number;
	target: number;
}

export default function StackedProgressBar({
	rainPast,
	rainForecast,
	loggedWater,
	weeklyTarget,
}: StackedProgressBarProps) {
	const theme = useTheme();
	// Normalize values to target, cap at 1
	const norm = (v: number) =>
		Math.max(0, Math.min(1, v / (weeklyTarget || 1)));
	const rainW = norm(rainPast);
	const forecastW = norm(rainForecast);
	const loggedW = norm(loggedWater);
	const sum = rainW + forecastW + loggedW;
	// If sum > 1, scale down proportionally
	if (sum > 1) {
		const scale = 1 / sum;
		return (
			<Bar
				rain={rainW * scale}
				forecast={forecastW * scale}
				logged={loggedW * scale}
				theme={theme}
				rainIn={rainPast}
				forecastIn={rainForecast}
				loggedIn={loggedWater}
				target={weeklyTarget}
			/>
		);
	}
	return (
		<Bar
			rain={rainW}
			forecast={forecastW}
			logged={loggedW}
			theme={theme}
			rainIn={rainPast}
			forecastIn={rainForecast}
			loggedIn={loggedWater}
			target={weeklyTarget}
		/>
	);
}

function Bar({
	rain,
	forecast,
	logged,
	theme,
	rainIn,
	forecastIn,
	loggedIn,
	target,
}: BarProps) {
	// Colors: blue for rain, green for logged, gray for forecast
	const rainColor = theme.palette.info.main || '#2196F3';
	const forecastColor = theme.palette.grey[500] || '#BDBDBD';
	const loggedColor = theme.palette.success.main || '#4A7C59';
	return (
		<Box
			sx={{
				width: '100%',
				height: 36,
				display: 'flex',
				borderRadius: 3,
				overflow: 'hidden',
				bgcolor: theme.palette.grey[200],
				border: `1px solid ${theme.palette.divider}`,
			}}
			aria-label={`Weekly progress bar: Rain ${rainIn.toFixed(2)} inches, Forecast ${forecastIn.toFixed(2)} inches, Logged ${loggedIn.toFixed(2)} inches, Target ${target.toFixed(2)} inches`}
			role="progressbar"
		>
			{rain > 0 && (
				<Tooltip title={`Rain: ${rainIn.toFixed(2)}"`} arrow>
					<Box
						sx={{
							width: `${rain * 100}%`,
							bgcolor: rainColor,
							height: '100%',
						}}
					/>
				</Tooltip>
			)}
			{forecast > 0 && (
				<Tooltip title={`Forecast: ${forecastIn.toFixed(2)}"`} arrow>
					<Box
						sx={{
							width: `${forecast * 100}%`,
							bgcolor: forecastColor,
							height: '100%',
						}}
					/>
				</Tooltip>
			)}
			{logged > 0 && (
				<Tooltip title={`Logged: ${loggedIn.toFixed(2)}"`} arrow>
					<Box
						sx={{
							width: `${logged * 100}%`,
							bgcolor: loggedColor,
							height: '100%',
						}}
					/>
				</Tooltip>
			)}
			{/* Fill to 100% if under target, for visual completeness */}
			{rain + forecast + logged < 1 && (
				<Box
					sx={{
						width: `${(1 - (rain + forecast + logged)) * 100}%`,
						bgcolor: 'transparent',
						height: '100%',
					}}
				/>
			)}
		</Box>
	);
}
