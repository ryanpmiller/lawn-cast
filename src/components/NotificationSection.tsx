import {
	Box,
	Typography,
	Switch,
	FormControlLabel,
	TextField,
	MenuItem,
	Alert,
} from '@mui/material';
import { useState } from 'react';
import { useLawnCastStore } from '../models/store';

export default function NotificationSection() {
	const settings = useLawnCastStore(s => s.settings);
	const update = useLawnCastStore(s => s.update);
	const [success, setSuccess] = useState(false);

	const showSuccess = () => {
		setSuccess(true);
		setTimeout(() => setSuccess(false), 2000);
	};

	const handleToggle = (checked: boolean) => {
		update({ notificationsEnabled: checked });
		showSuccess();
	};
	const handleHourChange = (value: number) => {
		update({ notificationHour: value });
		showSuccess();
	};

	return (
		<Box sx={{ mb: 4 }}>
			<Typography variant="h6" fontWeight={700} gutterBottom>
				Notifications
			</Typography>
			<FormControlLabel
				control={
					<Switch
						checked={settings.notificationsEnabled}
						onChange={e => handleToggle(e.target.checked)}
						color="primary"
					/>
				}
				label="Enable notifications"
				sx={{ mt: 2 }}
			/>
			{settings.notificationsEnabled && (
				<TextField
					select
					label="Notification Time"
					value={settings.notificationHour}
					onChange={e => handleHourChange(Number(e.target.value))}
					fullWidth
					sx={{ mt: 3, maxWidth: 200 }}
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
			{success && (
				<Alert severity="success" sx={{ mt: 2 }}>
					Notification settings updated!
				</Alert>
			)}
		</Box>
	);
}
