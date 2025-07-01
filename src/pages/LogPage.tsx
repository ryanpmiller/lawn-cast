import WeekLogTable from '../components/WeekLogTable';
import PageLayout from '../components/PageLayout';
import { Paper, Typography, LinearProgress } from '@mui/material';
import { useLawnCastStore } from '../models/store';
import { getWeekDates } from '../utils/dateUtils';

export default function LogPage() {
	const entries = useLawnCastStore(s => s.entries);
	const settings = useLawnCastStore(s => s.settings);

	// Calculate week dates using date-fns for consistent Sunday-Saturday week
	const weekDates = getWeekDates();

	const totalMinutes = weekDates.reduce(
		(sum, date) => sum + (entries[date]?.minutes || 0),
		0
	);
	const weeklyTarget = Math.round(
		(settings.sprinklerRateInPerHr || 0.5) * 60
	); // Example: 1 in = 60 min
	const progress = Math.min(totalMinutes / weeklyTarget, 1);

	return (
		<PageLayout title="Log" alignItems="center" titleAlign="center">
			<Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
				Water Log
			</Typography>
			<Paper
				elevation={0}
				sx={{
					p: 2,
					mb: 2,
					border: '1px solid',
					borderColor: 'divider',
					width: '100%',
					maxWidth: 420,
				}}
			>
				<Typography
					variant="subtitle1"
					fontWeight={700}
					color="text.primary"
				>
					Progress
				</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ mb: 1 }}
				>
					{totalMinutes} min / {weeklyTarget} min target
				</Typography>
				<LinearProgress
					variant="determinate"
					value={progress * 100}
					sx={{
						height: 8,
						borderRadius: 4,
						bgcolor: 'grey.100',
						'& .MuiLinearProgress-bar': { bgcolor: 'success.main' },
					}}
				/>
			</Paper>
			<WeekLogTable weekDates={weekDates} />
			<Paper
				variant="outlined"
				sx={{
					p: 2,
					bgcolor: 'background.paper',
					color: 'text.secondary',
					mt: 2,
				}}
			>
				<Typography variant="subtitle1" fontWeight={600} gutterBottom>
					How to Log Water
				</Typography>
				<Typography variant="body2">
					Enter the number of minutes you watered each day. Tap the
					pencil icon to edit. LawnCast will convert minutes to inches
					based on your sprinkler rate.
				</Typography>
			</Paper>
		</PageLayout>
	);
}
