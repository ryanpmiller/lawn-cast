import { useState } from 'react';
import { useLawnCastStore } from '../models/store';
import {
	Typography,
	IconButton,
	TextField,
	Divider,
	Box,
	InputAdornment,
	useTheme,
} from '@mui/material';
import { parseISO } from 'date-fns';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export default function WeekLogTable({ weekDates }: { weekDates: string[] }) {
	const entries = useLawnCastStore(s => s.entries);
	const setEntry = useLawnCastStore(s => s.setEntry);
	const theme = useTheme();
	const [editDate, setEditDate] = useState<string | null>(null);
	const [editValue, setEditValue] = useState('');

	const handleEdit = (date: string, value: number) => {
		setEditDate(date);
		setEditValue(value.toString());
	};

	const saveEdit = () => {
		const val = parseInt(editValue, 10);
		if (!isNaN(val) && val >= 0 && val <= 240 && editDate) {
			setEntry(editDate, val);
		}
		setEditDate(null);
		setEditValue('');
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') saveEdit();
		if (e.key === 'Escape') setEditDate(null);
	};

	return (
		<Box
			sx={{
				width: '100%',
				maxWidth: 420,
				mx: 'auto',
				borderRadius: 1,
				overflow: 'hidden',
			}}
		>
			{weekDates.map((date, idx) => {
				const entry = entries[date];
				const isEditing = editDate === date;
				const isToday = new Date().toISOString().slice(0, 10) === date;
				return (
					<Box
						key={date}
						sx={{
							display: 'flex',
							alignItems: 'center',
							px: 2,
							py: 1.5,
							bgcolor: isToday
								? 'rgba(0, 256, 0, 0.05)'
								: 'background.paper',
							borderRadius: 0,
							position: 'relative',
						}}
					>
						<Box
							sx={{
								minWidth: 32,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: entry?.minutes
									? 'success.main'
									: 'grey.400',
								mr: 1,
							}}
						>
							<WaterDropIcon fontSize="small" />
						</Box>
						<Box
							sx={{
								flex: 1,
								display: 'flex',
								alignItems: 'center',
							}}
						>
							<Typography
								fontWeight={700}
								color="text.primary"
								sx={{ minWidth: 90 }}
							>
								{parseISO(date).toLocaleDateString(undefined, {
									weekday: 'long',
								})}
							</Typography>
							<Box sx={{ flex: 1, textAlign: 'right', pr: 2 }}>
								{isEditing ? (
									<TextField
										value={editValue}
										onChange={e =>
											setEditValue(e.target.value)
										}
										onBlur={saveEdit}
										onKeyDown={handleKeyDown}
										type="number"
										size="small"
										inputProps={{
											min: 0,
											max: 240,
											style: {
												textAlign: 'right',
												width: 60,
											},
										}}
										autoFocus
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton
														size="small"
														onClick={saveEdit}
														color="success"
													>
														<AddIcon />
													</IconButton>
												</InputAdornment>
											),
										}}
									/>
								) : (
									<Typography
										fontWeight={700}
										color="text.primary"
										sx={{ fontSize: 18 }}
									>
										{entry?.minutes
											? `${entry.minutes} min`
											: '0 min'}
									</Typography>
								)}
							</Box>
						</Box>
						{!isEditing && (
							<IconButton
								aria-label="Add/Edit minutes"
								color="success"
								onClick={() =>
									handleEdit(date, entry?.minutes || 0)
								}
								sx={{ ml: 1 }}
							>
								<AddIcon />
							</IconButton>
						)}
						{entry?.minutes > 0 && !isEditing && (
							<IconButton
								aria-label="Reset minutes"
								color="inherit"
								onClick={() => setEntry(date, 0)}
								sx={{ ml: 0.5, color: theme.palette.grey[400] }}
							>
								<RestartAltIcon fontSize="small" />
							</IconButton>
						)}
						{idx < weekDates.length - 1 && (
							<Divider
								sx={{
									position: 'absolute',
									left: 0,
									right: 0,
									bottom: 0,
								}}
							/>
						)}
					</Box>
				);
			})}
		</Box>
	);
}
