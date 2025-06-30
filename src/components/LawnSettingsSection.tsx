import {
	Box,
	Stack,
	Typography,
	TextField,
	Alert,
	Button,
	MenuItem,
} from '@mui/material';
import { useState } from 'react';
import { useLawnCastStore } from '../models/store';

export default function LawnSettingsSection() {
	const settings = useLawnCastStore(s => s.settings);
	const update = useLawnCastStore(s => s.update);
	const [success, setSuccess] = useState(false);

	const speciesOptions = [
		{ value: 'kentucky_bluegrass', label: 'Kentucky Bluegrass' },
		{ value: 'tall_fescue', label: 'Tall Fescue' },
		{ value: 'bermuda', label: 'Bermuda' },
		{ value: 'zoysia', label: 'Zoysia' },
		{ value: 'st_augustine', label: 'St. Augustine' },
	];
	const sunOptions = [
		{ value: 'full', label: 'Full Sun (6+ hrs)' },
		{ value: 'partial', label: 'Partial Shade (3-6 hrs)' },
		{ value: 'shade', label: 'Full Shade (<3 hrs)' },
	];

	const handleSpeciesChange = (value: string) => {
		update({ grassSpecies: value as typeof settings.grassSpecies });
	};
	const handleSunChange = (value: string) => {
		update({ sunExposure: value as typeof settings.sunExposure });
	};

	const handleSave = () => {
		setSuccess(true);
		setTimeout(() => setSuccess(false), 2000);
	};

	return (
		<Box sx={{ width: '100%', mb: 4 }}>
			<Typography variant="h6" fontWeight={700} gutterBottom>
				Lawn Settings
			</Typography>
			<Stack
				direction={{ xs: 'column', sm: 'column', md: 'row' }}
				spacing={2}
				sx={{ mt: 1, mb: 2 }}
			>
				<TextField
					select
					label="Grass Species"
					value={settings.grassSpecies}
					onChange={e => handleSpeciesChange(e.target.value)}
					sx={{
						minWidth: { xs: '100%', sm: '100%', md: 180 },
						flex: 1,
					}}
					fullWidth={true}
				>
					{speciesOptions.map(opt => (
						<MenuItem key={opt.value} value={opt.value}>
							{opt.label}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					label="Sun Exposure"
					value={settings.sunExposure}
					onChange={e => handleSunChange(e.target.value)}
					sx={{
						minWidth: { xs: '100%', sm: '100%', md: 180 },
						flex: 1,
					}}
					fullWidth={true}
				>
					{sunOptions.map(opt => (
						<MenuItem key={opt.value} value={opt.value}>
							{opt.label}
						</MenuItem>
					))}
				</TextField>
			</Stack>
			<Button variant="contained" onClick={handleSave} sx={{ mt: 1 }}>
				Save
			</Button>
			{success && (
				<Alert severity="success" sx={{ mt: 2 }}>
					Lawn settings updated!
				</Alert>
			)}
		</Box>
	);
}
