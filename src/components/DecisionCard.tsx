import { Box, Typography } from '@mui/material';

export interface DecisionCardProps {
	decision: 'yes' | 'no';
	totalProjected: number;
	weeklyTarget: number;
}

export default function DecisionCard({
	decision,
	totalProjected,
	weeklyTarget,
}: DecisionCardProps) {
	const deficit = Math.max(weeklyTarget - totalProjected, 0);
	const isNo = decision === 'no';
	const bg = isNo ? 'success.light' : 'warning.light';
	const border = isNo ? 'success.main' : 'warning.main';
	const text = isNo ? 'success.dark' : 'warning.dark';
	return (
		<Box
			sx={{
				width: '100%',
				height: 240,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				bgcolor: bg,
				border: '2px solid',
				borderColor: border,
				borderRadius: 3,
				color: text,
				textAlign: 'center',
				px: 2,
			}}
			role="region"
			aria-label="Watering Recommendation"
		>
			<Typography variant="h5" fontWeight={700} gutterBottom>
				{isNo ? 'No need to water' : 'Water today'}
			</Typography>
			<Typography variant="body2">
				{isNo
					? `You've met your weekly target (${totalProjected.toFixed(2)}" / ${weeklyTarget.toFixed(2)}")`
					: `You're ${deficit.toFixed(2)}" short of your weekly target (${weeklyTarget.toFixed(2)}")`}
			</Typography>
		</Box>
	);
}
