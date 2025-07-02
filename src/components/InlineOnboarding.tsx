import { useState, useEffect } from 'react';
import {
	Button,
	Typography,
	Box,
	TextField,
	CircularProgress,
	Switch,
	FormControlLabel,
	MenuItem,
	Stepper,
	Step,
	StepLabel,
	Card,
	CardContent,
	CardActions,
	Stack,
	Alert,
	InputAdornment,
	IconButton,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ClearIcon from '@mui/icons-material/Clear';
import { searchZipAutocomplete } from '../api/nominatim';
import { useLawnCastStore } from '../models/store';
import SprinklerRateSlider from './SprinklerRateSlider';

export default function InlineOnboarding() {
	const [step, setStep] = useState(0);
	const [loading, setLoading] = useState(false);
	const [geoError, setGeoError] = useState('');
	const [sun, setSun] = useState<string>('full');
	const [species, setSpecies] = useState<string>('');
	const [sprinklerRate, setSprinklerRate] = useState<number>(0.5);
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);
	const [notificationHour, setNotificationHour] = useState(8);
	const [manualZip, setManualZip] = useState('');
	const [manualZipError, setManualZipError] = useState('');

	const updateSettings = useLawnCastStore(s => s.update);

	const steps = [
		'Location',
		'Lawn Details',
		'Sprinkler Setup',
		'Notifications',
	];

	// Step 0: Geolocation prompt
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
						setManualZip(mapped[0].zip);
						// Save location immediately to store
						updateSettings({
							zip: mapped[0].zip,
							lat: mapped[0].lat,
							lon: mapped[0].lon,
						});
						setStep(1); // Move to next step
					} else {
						setGeoError(
							'Could not determine ZIP from your location. Please enter it manually.'
						);
						// Stay on step 0 but show manual input
					}
				} catch {
					setGeoError(
						'Could not determine ZIP from your location. Please enter it manually.'
					);
				}
				setLoading(false);
			},
			() => {
				setGeoError(
					'Location permission denied or unavailable. Please enter your ZIP manually.'
				);
				setLoading(false);
			},
			{ timeout: 8000 }
		);
	};

	// Suggest species based on zone and sun (only used for initial suggestion)
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

	// Set initial species suggestion only once when component mounts
	useEffect(() => {
		if (!species) {
			setSpecies(suggestedSpecies());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Empty dependency array - only run on mount

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

	const handleClearZip = () => {
		setManualZip('');
		setManualZipError('');
	};

	const handleManualZipContinue = async () => {
		if (!/^\d{5}$/.test(manualZip)) {
			setManualZipError('Please enter a valid 5-digit ZIP code');
			return;
		}
		setManualZipError('');
		setLoading(true);
		try {
			const results = await searchZipAutocomplete(manualZip);
			const mapped = results
				.filter(
					r =>
						r.address.postcode &&
						r.address.postcode === manualZip &&
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
				// Save location immediately to store
				updateSettings({
					zip: mapped[0].zip,
					lat: mapped[0].lat,
					lon: mapped[0].lon,
				});
				setStep(1);
			} else {
				setManualZipError('ZIP code not found. Please try again.');
			}
		} catch {
			setManualZipError('Error looking up ZIP code. Please try again.');
		}
		setLoading(false);
	};

	function handleFinish() {
		// Most settings are already saved progressively, just ensure any remaining defaults are set
		const currentSettings = useLawnCastStore.getState().settings;
		updateSettings({
			// Ensure zone and theme are set if not already configured
			zone: currentSettings.zone || 'cool', // TODO: infer from ZIP/region if available
			theme: currentSettings.theme || 'system',
			// Mark onboarding as complete
			onboardingComplete: true,
		});
	}

	return (
		<Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
			<Typography variant="h4" gutterBottom textAlign="center">
				Welcome to LawnCast!
			</Typography>
			<Typography
				variant="body1"
				color="text.secondary"
				textAlign="center"
				sx={{ mb: 4 }}
			>
				Let's get your lawn care setup in just a few steps.
			</Typography>

			<Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
				{steps.map(label => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>

			{/* Step 0: Location */}
			{step === 0 && (
				<Card>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							Set Your Location
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 3 }}
						>
							To provide accurate watering recommendations,
							LawnCast needs your location.
						</Typography>

						{!geoError && !loading && (
							<Stack spacing={2}>
								<Button
									variant="contained"
									onClick={handleAllowLocation}
									disabled={loading}
									size="large"
								>
									Use My Current Location
								</Button>
								<Typography
									variant="body2"
									textAlign="center"
									color="text.secondary"
								>
									or
								</Typography>
							</Stack>
						)}

						<Box sx={{ mt: 2 }}>
							<TextField
								label="ZIP Code"
								value={manualZip}
								onChange={e => {
									setManualZip(e.target.value);
									setManualZipError('');
								}}
								error={!!manualZipError}
								helperText={
									manualZipError ||
									'Enter your 5-digit ZIP code'
								}
								inputProps={{ maxLength: 5, pattern: '[0-9]*' }}
								fullWidth
								sx={{ mb: 2 }}
								InputProps={{
									endAdornment: manualZip ? (
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
								variant="outlined"
								onClick={handleManualZipContinue}
								disabled={loading || !manualZip}
								fullWidth
							>
								{loading ? (
									<CircularProgress size={24} />
								) : (
									'Continue'
								)}
							</Button>
						</Box>

						{geoError && (
							<Alert severity="info" sx={{ mt: 2 }}>
								{geoError}
							</Alert>
						)}
					</CardContent>
				</Card>
			)}

			{/* Step 1: Lawn Details */}
			{step === 1 && (
				<Card>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							Lawn Details
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 3 }}
						>
							Tell us about your lawn to get personalized
							recommendations.
						</Typography>

						<Typography gutterBottom>
							How much sun does your lawn get?
						</Typography>
						<Box
							sx={{
								display: 'flex',
								gap: 1,
								mb: 3,
								flexWrap: 'wrap',
							}}
						>
							{sunOptions.map(opt => (
								<Button
									key={opt.value}
									variant={
										sun === opt.value
											? 'contained'
											: 'outlined'
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
									size="small"
								>
									{opt.label}
								</Button>
							))}
						</Box>

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
							helperText="Showing species compatible with your sun exposure"
						>
							{speciesOptions
								.filter(s => s.sun.includes(sun))
								.map(opt => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
						</TextField>
					</CardContent>
					<CardActions>
						<Button onClick={() => setStep(0)}>Back</Button>
						<Box sx={{ flexGrow: 1 }} />
						<Button variant="contained" onClick={() => setStep(2)}>
							Continue
						</Button>
					</CardActions>
				</Card>
			)}

			{/* Step 2: Sprinkler Setup */}
			{step === 2 && (
				<Card>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							Sprinkler Calibration
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 2 }}
						>
							To give accurate watering advice, LawnCast needs to
							know how much water your sprinklers put out.
						</Typography>
						<Alert
							icon={<InfoIcon fontSize="inherit" />}
							sx={{
								mb: 3,
								color: 'text.secondary',
								backgroundColor: 'transparent',
								border: '1px solid',
								borderColor: 'success.dark',
							}}
						>
							<strong>Tuna-Can Test:</strong> Place 3-5 empty tuna
							cans around your lawn. Run your sprinklers for 15
							minutes. Measure the average depth of water in the
							cans (in inches). Multiply by 4 to get your
							sprinkler rate in inches per hour.
						</Alert>

						<SprinklerRateSlider
							value={sprinklerRate}
							onChange={value => {
								setSprinklerRate(value);
								updateSettings({
									sprinklerRateInPerHr: value,
								});
							}}
						/>
					</CardContent>
					<CardActions>
						<Button onClick={() => setStep(1)}>Back</Button>
						<Box sx={{ flexGrow: 1 }} />
						<Button
							variant="contained"
							onClick={() => setStep(3)}
							disabled={
								!sprinklerRate ||
								sprinklerRate < 0.1 ||
								sprinklerRate > 2.0
							}
						>
							Continue
						</Button>
					</CardActions>
				</Card>
			)}

			{/* Step 3: Notifications */}
			{step === 3 && (
				<Card>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							Notifications
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 3 }}
						>
							Would you like to receive watering reminders?
						</Typography>
						<FormControlLabel
							control={
								<Switch
									checked={notificationsEnabled}
									onChange={e => {
										setNotificationsEnabled(
											e.target.checked
										);
										// Save notifications setting immediately
										updateSettings({
											notificationsEnabled:
												e.target.checked,
										});
									}}
									color="primary"
								/>
							}
							label="Enable notifications"
							sx={{ mb: 2 }}
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
										notificationHour: Number(
											e.target.value
										),
									});
								}}
								fullWidth
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
					</CardContent>
					<CardActions>
						<Button onClick={() => setStep(2)}>Back</Button>
						<Box sx={{ flexGrow: 1 }} />
						<Button variant="contained" onClick={handleFinish}>
							Get Started!
						</Button>
					</CardActions>
				</Card>
			)}
		</Box>
	);
}
