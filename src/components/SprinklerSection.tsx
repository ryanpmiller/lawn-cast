import { Box, Typography, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useLawnCastStore } from '../models/store';
import SprinklerRateSlider from './SprinklerRateSlider';

export default function SprinklerSection() {
	const settings = useLawnCastStore(s => s.settings);
	const update = useLawnCastStore(s => s.update);

	const handleRateChange = (value: number) => {
		update({ sprinklerRateInPerHr: value });
	};

	return (
		<Box sx={{ mb: 4 }}>
			<Typography variant="h6" fontWeight={700} gutterBottom>
				Sprinkler Calibration
			</Typography>
			<Alert
				icon={<InfoIcon fontSize="inherit" />}
				sx={{
					mb: 2,
					color: 'text.secondary',
					backgroundColor: 'transparent',
					border: '1px solid',
					borderColor: 'success.dark',
				}}
			>
				<strong>Tuna-Can Test:</strong> Place 3-5 empty tuna cans around
				your lawn. Run your sprinklers for 15 minutes. Measure the
				average depth of water in the cans (in inches). Multiply by 4 to
				get your sprinkler rate in inches per hour.
			</Alert>
			<SprinklerRateSlider
				value={settings.sprinklerRateInPerHr}
				onChange={handleRateChange}
				sx={{ maxWidth: 400, mb: 2 }}
			/>
		</Box>
	);
}
