import { Box, Typography } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
	const bg = isNo ? 'success.dark' : 'info.dark';
	const border = isNo ? 'success.main' : 'info.main';
	const text = 'white';
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
			{isNo ? (
				<CheckCircleIcon sx={{ fontSize: 48 }} />
			) : (
				<WaterDropIcon sx={{ fontSize: 48 }} />
			)}
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
