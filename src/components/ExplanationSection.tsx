import { Box, Typography, Stack, Paper } from '@mui/material';
import type { CalculateDecisionResult } from '../models/logic';

export interface ExplanationSectionProps {
	decision: CalculateDecisionResult;
	rainPast: number;
	rainForecast: number;
	loggedWater: number;
}

export default function ExplanationSection({
	decision,
	rainPast,
	rainForecast,
	loggedWater,
}: ExplanationSectionProps) {
	return (
		<Paper
			variant="outlined"
			sx={{
				p: { xs: 2, sm: 3 },
				bgcolor: 'background.paper',
				borderRadius: 2,
				boxShadow: 'none',
			}}
		>
			<Typography variant="subtitle1" fontWeight={600} gutterBottom>
				Why this recommendation?
			</Typography>
			<Typography variant="body2" sx={{ mb: 2 }}>
				{decision.decision === 'no'
					? "You've met your lawn's weekly water needs based on recent rain, forecast, and your own watering."
					: 'Your lawn is projected to be below its weekly water target. Consider watering today to keep it healthy.'}
			</Typography>
			<Stack
				direction="row"
				spacing={2}
				justifyContent="space-between"
				alignItems="flex-start"
				sx={{ mb: 2, width: '100%' }}
			>
				<Breakdown label="Rain" value={rainPast} color="info.main" />
				<Breakdown
					label="Forecast"
					value={rainForecast}
					color="grey.500"
				/>
				<Breakdown
					label="Logged"
					value={loggedWater}
					color="success.main"
				/>
			</Stack>
			<Typography variant="caption" color="text.secondary">
				Weekly target: {decision.weeklyTarget.toFixed(2)}&quot; • Total
				projected: {decision.totalProjected.toFixed(2)}&quot;
			</Typography>
		</Paper>
	);
}

function Breakdown({
	label,
	value,
	color,
}: {
	label: string;
	value: number;
	color: string;
}) {
	return (
		<Stack alignItems="center" spacing={0.5} minWidth={72}>
			<Typography variant="caption" color={color} fontWeight={700}>
				{label}
			</Typography>
			<Box
				sx={{
					bgcolor: color,
					color: 'background.paper',
					borderRadius: 2,
					px: 2.5,
					py: 1,
					fontWeight: 700,
					fontSize: 20,
					minWidth: 64,
					textAlign: 'center',
				}}
			>
				{value.toFixed(2)}&quot;
			</Box>
		</Stack>
	);
}
