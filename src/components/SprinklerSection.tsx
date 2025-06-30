import { Box, Typography, TextField, Alert, Button } from '@mui/material';
import { useState } from 'react';
import { useLawnCastStore } from '../models/store';
import { useSuccessAlert } from '../hooks/useSuccessAlert';

export default function SprinklerSection() {
	const settings = useLawnCastStore(s => s.settings);
	const update = useLawnCastStore(s => s.update);
	const [rateError, setRateError] = useState('');
	const { success, showSuccess } = useSuccessAlert();

	const handleRateChange = (value: number) => {
		update({ sprinklerRateInPerHr: value });
	};

	const handleSave = () => {
		if (
			isNaN(settings.sprinklerRateInPerHr) ||
			settings.sprinklerRateInPerHr < 0.1 ||
			settings.sprinklerRateInPerHr > 2
		) {
			setRateError('Enter a value between 0.1 and 2.0');
			return;
		}
		setRateError('');
		showSuccess();
	};

	return (
		<Box sx={{ mb: 4 }}>
			<Typography variant="h6" fontWeight={700} gutterBottom>
				Sprinkler Calibration
			</Typography>
			<Typography variant="body2" sx={{ mb: 2 }}>
				<b>Tuna-Can Test:</b> Place 3-5 empty tuna cans (or similar)
				around your lawn. Run your sprinklers for 15 minutes. Measure
				the average depth of water in the cans (in inches). Multiply by
				4 to get your sprinkler rate in inches per hour.
			</Typography>
			<TextField
				label="Sprinkler Rate (in/hr)"
				type="number"
				value={settings.sprinklerRateInPerHr}
				onChange={e => handleRateChange(parseFloat(e.target.value))}
				inputProps={{ min: 0.1, max: 2, step: 0.01 }}
				error={!!rateError}
				helperText={
					rateError || 'Typical range: 0.3–1.0 in/hr. Default is 0.5.'
				}
				sx={{ maxWidth: 200 }}
			/>
			<Button
				variant="contained"
				onClick={handleSave}
				sx={{ ml: 2, mt: { xs: 2, sm: 0 } }}
			>
				Save
			</Button>
			{success && (
				<Alert severity="success" sx={{ mt: 2 }}>
					Sprinkler rate updated!
				</Alert>
			)}
		</Box>
	);
}
