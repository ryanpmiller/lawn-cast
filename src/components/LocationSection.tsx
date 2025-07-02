import {
	Box,
	Typography,
	TextField,
	Button,
	Stack,
	InputAdornment,
	IconButton,
} from '@mui/material';
import { useState } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import { useLawnCastStore } from '../models/store';
import { searchZipAutocomplete } from '../api/nominatim';

export default function LocationSection() {
	const settings = useLawnCastStore(s => s.settings);
	const update = useLawnCastStore(s => s.update);
	const [manualZipError, setManualZipError] = useState('');
	const [zipLoading, setZipLoading] = useState(false);

	const handleManualZipChange = (value: string) => {
		update({ zip: value });
		// Clear any previous errors when user starts typing
		if (manualZipError) {
			setManualZipError('');
		}
	};

	const handleClearZip = () => {
		update({ zip: '' });
		setManualZipError('');
	};

	const handleManualZipSave = async () => {
		if (!/^\d{5}$/.test(settings.zip)) {
			setManualZipError('Please enter a valid 5-digit ZIP code.');
			return;
		}
		setZipLoading(true);
		setManualZipError('');
		try {
			const results = await searchZipAutocomplete(settings.zip);
			const mapped = results
				.filter(
					r =>
						r.address.postcode &&
						/^\d{5}$/.test(r.address.postcode) &&
						r.address.country === 'United States'
				)
				.map(r => ({
					zip: r.address.postcode!,
					lat: parseFloat(r.lat),
					lon: parseFloat(r.lon),
				}));
			if (mapped.length > 0) {
				update({
					zip: mapped[0].zip,
					lat: mapped[0].lat,
					lon: mapped[0].lon,
				});
			} else {
				setManualZipError('ZIP code not found.');
			}
		} finally {
			setZipLoading(false);
		}
	};

	return (
		<Box sx={{ width: '100%', mb: 4 }}>
			<Typography variant="h6" fontWeight={700} gutterBottom>
				Location
			</Typography>
			<Typography variant="body2" sx={{ mb: 2 }}>
				Current ZIP: <b>{settings.zip || 'Not set'}</b>
			</Typography>
			<Stack
				direction="row"
				spacing={1}
				alignItems="flex-start"
				sx={{ maxWidth: 400 }}
			>
				<TextField
					label="Update ZIP code"
					variant="outlined"
					value={settings.zip}
					onChange={e => handleManualZipChange(e.target.value)}
					error={!!manualZipError}
					helperText={manualZipError}
					inputProps={{ maxLength: 5 }}
					sx={{ flex: 1, minWidth: 200 }}
					InputProps={{
						endAdornment: settings.zip ? (
							<InputAdornment position="end">
								<IconButton
									onClick={handleClearZip}
									edge="end"
									size="small"
									aria-label="clear zip code"
								>
									<ClearIcon />
								</IconButton>
							</InputAdornment>
						) : null,
					}}
				/>
				<Button
					variant="contained"
					onClick={handleManualZipSave}
					disabled={
						zipLoading || !settings.zip || settings.zip.length !== 5
					}
					sx={{ mt: 0, height: 56 }} // Match TextField height
				>
					{zipLoading ? 'Saving...' : 'Save'}
				</Button>
			</Stack>
		</Box>
	);
}
