import { Box, Typography, TextField, Alert, Button } from '@mui/material';
import { useState } from 'react';
import { useLawnCastStore } from '../models/store';
import { searchZipAutocomplete } from '../api/nominatim';

export default function LocationSection() {
	const settings = useLawnCastStore(s => s.settings);
	const update = useLawnCastStore(s => s.update);
	const [manualZipError, setManualZipError] = useState('');
	const [zipLoading, setZipLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const handleManualZipChange = (value: string) => {
		update({ zip: value });
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
				setSuccess(true);
				setTimeout(() => setSuccess(false), 2000);
			} else {
				setManualZipError('ZIP code not found.');
			}
		} finally {
			setZipLoading(false);
		}
	};

	return (
		<Box sx={{ mb: 4 }}>
			<Typography variant="h6" fontWeight={700} gutterBottom>
				Location
			</Typography>
			<Typography variant="body2" sx={{ mb: 1 }}>
				Current ZIP: <b>{settings.zip || 'Not set'}</b>
			</Typography>
			<TextField
				label="Update ZIP code"
				variant="outlined"
				fullWidth
				value={settings.zip}
				onChange={e => handleManualZipChange(e.target.value)}
				onBlur={handleManualZipSave}
				error={!!manualZipError}
				helperText={manualZipError}
				inputProps={{ maxLength: 5 }}
				sx={{ maxWidth: 320, mt: 1 }}
			/>
			<Button
				variant="contained"
				onClick={handleManualZipSave}
				disabled={zipLoading}
				sx={{ mt: 1 }}
			>
				{zipLoading ? 'Saving...' : 'Save'}
			</Button>
			{success && (
				<Alert severity="success" sx={{ mt: 2 }}>
					Location updated!
				</Alert>
			)}
		</Box>
	);
}
