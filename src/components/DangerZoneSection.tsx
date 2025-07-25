import {
	Box,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material';
import { useState } from 'react';
import { useLawnCastStore } from '../models/store';

export default function DangerZoneSection() {
	const reset = useLawnCastStore(s => s.reset);
	const [open, setOpen] = useState(false);

	const handleClear = () => {
		reset();
		setOpen(false);
	};

	return (
		<Box>
			<Button
				variant="contained"
				color="error"
				onClick={() => setOpen(true)}
			>
				Clear All Data
			</Button>
			<Dialog open={open} onClose={() => setOpen(false)}>
				<DialogTitle>Confirm Data Reset</DialogTitle>
				<DialogContent>
					Are you sure you want to clear all app data? This cannot be
					undone.
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Cancel</Button>
					<Button
						onClick={handleClear}
						color="error"
						variant="contained"
					>
						Clear All Data
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
