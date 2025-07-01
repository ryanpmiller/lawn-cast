import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	TextField,
	CircularProgress,
	Switch,
	FormControlLabel,
	MenuItem,
} from '@mui/material';
import { searchZipAutocomplete } from '../api/nominatim';
import { useLawnCastStore } from '../models/store';

interface OnboardingWizardProps {
	open: boolean;
	onClose: () => void;
}

interface ZipOption {
	label: string;
	zip: string;
	lat: number;
	lon: number;
}

export default function OnboardingWizard({
	open,
	onClose,
}: OnboardingWizardProps) {
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [geoError, setGeoError] = useState('');
	const [selectedZip, setSelectedZip] = useState<ZipOption | null>(null);
	const [sun, setSun] = useState<string>('full');
	const [species, setSpecies] = useState<string>('');
	const [sprinklerRate, setSprinklerRate] = useState<number>(0.5);
	const [rateError, setRateError] = useState('');
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);
	const [notificationHour, setNotificationHour] = useState(8);
	const [manualZip, setManualZip] = useState('');
	const [manualZipError, setManualZipError] = useState('');

	const updateSettings = useLawnCastStore(s => s.update);

	// Step 1: Geolocation prompt
	const handleAllowLocation = () => {
		setLoading(true);
		setGeoError('');
		if (!navigator.geolocation) {
			setGeoError('Geolocation is not supported by your browser.');
			setLoading(false);
			return;
		}
		navigator.geolocation.getCurrentPosition(
			async pos => {
				const lat = pos.coords.latitude;
				const lon = pos.coords.longitude;
				// Use Nominatim to reverse-geocode ZIP
				try {
					const results = await searchZipAutocomplete(
						`${lat},${lon}`
					);
					const mapped = results
						.filter(
							r =>
								r.address.postcode &&
								/^\d{5}$/.test(r.address.postcode) &&
								r.address.country === 'United States'
						)
						.map(r => ({
							label:
								r.address.city && r.address.state
									? `${r.address.postcode} (${r.address.city}, ${r.address.state})`
									: r.address.postcode!,
							zip: r.address.postcode!,
							lat: parseFloat(r.lat),
							lon: parseFloat(r.lon),
						}));
					if (mapped.length > 0) {
						setSelectedZip(mapped[0]);
						setManualZip(mapped[0].zip);
						// Save location immediately to store
						updateSettings({
							zip: mapped[0].zip,
							lat: mapped[0].lat,
							lon: mapped[0].lon,
						});
						setStep(1.5); // Show ZIP input with prefilled value, do not advance
					} else {
						setGeoError(
							'Could not determine ZIP from your location. Please enter it manually.'
						);
						setStep(1.5); // Show ZIP input
					}
				} catch {
					setGeoError(
						'Could not determine ZIP from your location. Please enter it manually.'
					);
					setStep(1.5);
				}
				setLoading(false);
			},
			() => {
				setGeoError(
					'Location permission denied or unavailable. Please enter your ZIP manually.'
				);
				setStep(1.5);
				setLoading(false);
			},
			{ timeout: 8000 }
		);
	};

	// Suggest species based on zone and sun
	const zone = undefined; // TODO: get from settings or onboarding state
	const suggestedSpecies = () => {
		// Use zone if available, else default to cool
		const userZone = zone || 'cool';
		// Find first species matching zone and sun
		const match = speciesOptions.find(
			s => s.zones.includes(userZone) && s.sun.includes(sun)
		);
		return match ? match.value : speciesOptions[0].value;
	};

	// When sun changes, update suggested species
	useEffect(() => {
		setSpecies(suggestedSpecies());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sun]);

	const sunOptions = [
		{ value: 'full', label: 'Full Sun (6+ hrs)' },
		{ value: 'partial', label: 'Partial Shade (3-6 hrs)' },
		{ value: 'shade', label: 'Full Shade (<3 hrs)' },
	];
	const speciesOptions = [
		{
			value: 'kentucky_bluegrass',
			label: 'Kentucky Bluegrass',
			zones: ['cool'],
			sun: ['full', 'partial'],
		},
		{
			value: 'tall_fescue',
			label: 'Tall Fescue',
			zones: ['cool', 'transition'],
			sun: ['full', 'partial', 'shade'],
		},
		{ value: 'bermuda', label: 'Bermuda', zones: ['warm'], sun: ['full'] },
		{
			value: 'zoysia',
			label: 'Zoysia',
			zones: ['warm', 'transition'],
			sun: ['full', 'partial'],
		},
		{
			value: 'st_augustine',
			label: 'St. Augustine',
			zones: ['warm'],
			sun: ['full', 'partial', 'shade'],
		},
	];

	function handleSkip() {
		// Only set defaults for settings that haven't been configured yet
		// Preserve any location and other settings that were already set
		const currentSettings = useLawnCastStore.getState().settings;
		updateSettings({
			// Keep existing location if set, otherwise use defaults
			zip: currentSettings.zip || selectedZip?.zip || '',
			lat: currentSettings.lat || selectedZip?.lat || 0,
			lon: currentSettings.lon || selectedZip?.lon || 0,
			// Set defaults for unconfigured settings
			zone: currentSettings.zone || 'cool',
			grassSpecies: currentSettings.grassSpecies || 'kentucky_bluegrass',
			sunExposure: currentSettings.sunExposure || 'full',
			sprinklerRateInPerHr: currentSettings.sprinklerRateInPerHr || 0.5,
			notificationsEnabled: currentSettings.notificationsEnabled || false,
			notificationHour: currentSettings.notificationHour || 8,
			theme: currentSettings.theme || 'system',
		});
		onClose();
	}

	function handleFinish() {
		// Most settings are already saved progressively, just ensure any remaining defaults are set
		const currentSettings = useLawnCastStore.getState().settings;
		updateSettings({
			// Ensure zone and theme are set if not already configured
			zone: currentSettings.zone || 'cool', // TODO: infer from ZIP/region if available
			theme: currentSettings.theme || 'system',
		});
		onClose();
	}

	const handleManualZipContinue = async () => {
		if (!/^[0-9]{5}$/.test(manualZip)) {
			setManualZipError('Please enter a valid 5-digit ZIP code.');
			return;
		}
		setLoading(true);
		setManualZipError('');
		try {
			const results = await searchZipAutocomplete(manualZip, 0);
			const mapped = results
				.filter(
					r =>
						r.address.postcode &&
						/^[0-9]{5}$/.test(r.address.postcode) &&
						r.address.country === 'United States'
				)
				.map(r => ({
					label:
						r.address.city && r.address.state
							? `${r.address.postcode} (${r.address.city}, ${r.address.state})`
							: r.address.postcode!,
					zip: r.address.postcode!,
					lat: parseFloat(r.lat),
					lon: parseFloat(r.lon),
				}));
			if (mapped.length > 0) {
				setSelectedZip(mapped[0]);
				// Save location immediately to store
				updateSettings({
					zip: mapped[0].zip,
					lat: mapped[0].lat,
					lon: mapped[0].lon,
				});
				setStep(2);
			} else {
				setManualZipError('ZIP code not found.');
			}
		} finally {
			setLoading(false);
		}
	};

	if (step === 2 && selectedZip) {
		return (
			<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
				<DialogTitle>Step 2: Sun Exposure & Grass Species</DialogTitle>
				<DialogContent>
					<Typography gutterBottom>
						How much sun does your lawn get?
					</Typography>
					<Box sx={{ display: 'flex', gap: 2, my: 2 }}>
						{sunOptions.map(opt => (
							<Button
								key={opt.value}
								variant={
									sun === opt.value ? 'contained' : 'outlined'
								}
								onClick={() => {
									setSun(opt.value);
									// Save sun exposure immediately
									updateSettings({
										sunExposure: opt.value as
											| 'full'
											| 'partial'
											| 'shade',
									});
								}}
							>
								{opt.label}
							</Button>
						))}
					</Box>
					<Typography gutterBottom sx={{ mt: 2 }}>
						Suggested species:
					</Typography>
					<TextField
						select
						label="Grass Species"
						value={species}
						onChange={e => {
							setSpecies(e.target.value);
							// Save grass species immediately
							updateSettings({
								grassSpecies: e.target.value as
									| 'kentucky_bluegrass'
									| 'tall_fescue'
									| 'bermuda'
									| 'zoysia'
									| 'st_augustine',
							});
						}}
						SelectProps={{ native: true }}
						fullWidth
					>
						{speciesOptions
							.filter(s => s.sun.includes(sun))
							.map(opt => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
					</TextField>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleSkip} color="secondary">
						Skip for now
					</Button>
					<Button onClick={onClose}>Close</Button>
					<Button onClick={() => setStep(3)} variant="contained">
						Continue
					</Button>
				</DialogActions>
			</Dialog>
		);
	}

	if (step === 3) {
		return (
			<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
				<DialogTitle>Step 3: Sprinkler Calibration</DialogTitle>
				<DialogContent>
					<Typography gutterBottom>
						To give accurate watering advice, LawnCast needs to know
						how much water your sprinklers put out.
					</Typography>
					<Typography variant="body2" sx={{ mt: 2 }}>
						<b>Tuna-Can Test:</b> Place 3-5 empty tuna cans (or
						similar) around your lawn. Run your sprinklers for 15
						minutes. Measure the average depth of water in the cans
						(in inches). Multiply by 4 to get your sprinkler rate in
						inches per hour.
					</Typography>
					<TextField
						label="Sprinkler Rate (in/hr)"
						type="number"
						value={sprinklerRate}
						onChange={e => {
							const val = parseFloat(e.target.value);
							setSprinklerRate(val);
							setRateError(
								!isNaN(val) && val >= 0.1 && val <= 2.0
									? ''
									: 'Enter a value between 0.1 and 2.0'
							);
							// Save sprinkler rate immediately if valid
							if (!isNaN(val) && val >= 0.1 && val <= 2.0) {
								updateSettings({
									sprinklerRateInPerHr: val,
								});
							}
						}}
						inputProps={{ min: 0.1, max: 2, step: 0.01 }}
						fullWidth
						sx={{ mt: 3 }}
						error={!!rateError}
						helperText={
							rateError ||
							'Typical range: 0.3–1.0 in/hr. Default is 0.5.'
						}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleSkip} color="secondary">
						Skip for now
					</Button>
					<Button onClick={onClose}>Close</Button>
					<Button
						onClick={() => setStep(4)}
						variant="contained"
						disabled={!!rateError || !sprinklerRate}
					>
						Continue
					</Button>
				</DialogActions>
			</Dialog>
		);
	}

	if (step === 4) {
		return (
			<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
				<DialogTitle>Step 4: Notifications</DialogTitle>
				<DialogContent>
					<Typography gutterBottom>
						Would you like to receive watering reminders?
					</Typography>
					<FormControlLabel
						control={
							<Switch
								checked={notificationsEnabled}
								onChange={e => {
									setNotificationsEnabled(e.target.checked);
									// Save notifications setting immediately
									updateSettings({
										notificationsEnabled: e.target.checked,
									});
								}}
								color="primary"
							/>
						}
						label="Enable notifications"
						sx={{ mt: 2 }}
					/>
					{notificationsEnabled && (
						<TextField
							select
							label="Notification Time"
							value={notificationHour}
							onChange={e => {
								setNotificationHour(Number(e.target.value));
								// Save notification time immediately
								updateSettings({
									notificationHour: Number(e.target.value),
								});
							}}
							fullWidth
							sx={{ mt: 3 }}
						>
							{[...Array(24)].map((_, i) => (
								<MenuItem key={i} value={i}>
									{i === 0
										? '12:00 AM'
										: i < 12
											? `${i}:00 AM`
											: i === 12
												? '12:00 PM'
												: `${i - 12}:00 PM`}
								</MenuItem>
							))}
						</TextField>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleSkip} color="secondary">
						Skip for now
					</Button>
					<Button onClick={onClose}>Close</Button>
					<Button onClick={handleFinish} variant="contained">
						Finish
					</Button>
				</DialogActions>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} maxWidth="sm" fullWidth disableEscapeKeyDown>
			<DialogTitle>Step 1: Set Your Location (Required)</DialogTitle>
			<DialogContent>
				{step === 1 && (
					<Box sx={{ mt: 1 }}>
						<Typography gutterBottom>
							To provide accurate watering recommendations,
							LawnCast requires your location. Please choose one
							of the options below:
						</Typography>
						<Button
							variant="contained"
							onClick={handleAllowLocation}
							disabled={loading}
							sx={{ mt: 2 }}
						>
							{loading ? (
								<CircularProgress size={24} />
							) : (
								'Allow Location Access'
							)}
						</Button>
						{!loading && (
							<Button
								variant="text"
								onClick={() => setStep(1.5)}
								sx={{ mt: 2, ml: 2 }}
							>
								Enter ZIP manually
							</Button>
						)}
						{geoError && (
							<Typography color="error" sx={{ mt: 2 }}>
								{geoError}
							</Typography>
						)}
					</Box>
				)}
				{step === 1.5 && (
					<Box sx={{ mt: 1 }}>
						<Typography gutterBottom>
							Please enter your 5-digit ZIP code:
						</Typography>
						<TextField
							label="ZIP code"
							variant="outlined"
							fullWidth
							value={manualZip}
							onChange={e => setManualZip(e.target.value)}
							error={!!manualZipError}
							helperText={manualZipError}
							inputProps={{ maxLength: 5 }}
							sx={{ mb: 2 }}
						/>
						<Button
							variant="contained"
							onClick={handleManualZipContinue}
							disabled={loading}
						>
							{loading ? (
								<CircularProgress size={20} />
							) : (
								'Continue'
							)}
						</Button>
					</Box>
				)}
			</DialogContent>
		</Dialog>
	);
}
