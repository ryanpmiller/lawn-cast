import {
	Box,
	Typography,
	ToggleButtonGroup,
	ToggleButton,
} from '@mui/material';
import { useLawnCastStore } from '../models/store';

export default function ThemeToggleSection() {
	const settings = useLawnCastStore(s => s.settings);
	const update = useLawnCastStore(s => s.update);

	const handleChange = (
		_event: React.MouseEvent<HTMLElement>,
		value: 'light' | 'dark' | 'system'
	) => {
		if (value !== null) {
			update({ theme: value });
		}
	};

	return (
		<Box sx={{ width: '100%', mb: 4 }}>
			<Typography variant="h6" fontWeight={700} gutterBottom>
				Theme
			</Typography>
			<ToggleButtonGroup
				value={settings.theme}
				exclusive
				onChange={handleChange}
				aria-label="theme selection"
				fullWidth
				sx={{ mt: 1 }}
			>
				<ToggleButton value="light" aria-label="light theme">
					Light
				</ToggleButton>
				<ToggleButton value="dark" aria-label="dark theme">
					Dark
				</ToggleButton>
				<ToggleButton value="system" aria-label="system theme">
					System
				</ToggleButton>
			</ToggleButtonGroup>
		</Box>
	);
}
