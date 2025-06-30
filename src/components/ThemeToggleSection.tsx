import { Box, Typography, Stack, Button, Alert } from '@mui/material';
import { useState } from 'react';
import { useLawnCastStore } from '../models/store';

export default function ThemeToggleSection() {
	const settings = useLawnCastStore(s => s.settings);
	const update = useLawnCastStore(s => s.update);
	const [success, setSuccess] = useState(false);

	const handleChange = (value: 'light' | 'dark' | 'system') => {
		update({ theme: value });
		setSuccess(true);
		setTimeout(() => setSuccess(false), 2000);
	};

	return (
		<Box sx={{ mb: 4 }}>
			<Typography variant="h6" fontWeight={700} gutterBottom>
				Theme
			</Typography>
			<Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }}>
				<Button
					variant={
						settings.theme === 'light' ? 'contained' : 'outlined'
					}
					onClick={() => handleChange('light')}
				>
					Light
				</Button>
				<Button
					variant={
						settings.theme === 'dark' ? 'contained' : 'outlined'
					}
					onClick={() => handleChange('dark')}
				>
					Dark
				</Button>
				<Button
					variant={
						settings.theme === 'system' ? 'contained' : 'outlined'
					}
					onClick={() => handleChange('system')}
				>
					System
				</Button>
			</Stack>
			{success && (
				<Alert severity="success" sx={{ mt: 2 }}>
					Theme updated!
				</Alert>
			)}
		</Box>
	);
}
