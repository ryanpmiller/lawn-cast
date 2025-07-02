import { Box, Typography, Slider } from '@mui/material';

interface SprinklerRateSliderProps {
	value: number;
	onChange: (value: number) => void;
	showLabel?: boolean;
	sx?: object;
}

const marks = [
	{ value: 0.1, label: '0.1' },
	{ value: 0.3, label: '0.3' },
	{ value: 0.5, label: '0.5' },
	{ value: 0.75, label: '0.75' },
	{ value: 1.0, label: '1.0' },
	{ value: 1.5, label: '1.5' },
	{ value: 2.0, label: '2.0' },
];

export default function SprinklerRateSlider({
	value,
	onChange,
	showLabel = true,
	sx = {},
}: SprinklerRateSliderProps) {
	const handleChange = (_event: Event, newValue: number | number[]) => {
		const val = Array.isArray(newValue) ? newValue[0] : newValue;
		onChange(val);
	};

	return (
		<Box sx={{ px: 2, ...sx }}>
			{showLabel && (
				<Typography variant="body2" gutterBottom>
					Sprinkler Rate: <strong>{value} in/hr</strong>
				</Typography>
			)}
			<Slider
				value={value}
				onChange={handleChange}
				min={0.1}
				max={2.0}
				step={0.05}
				marks={marks}
				valueLabelDisplay="off"
				valueLabelFormat={val => `${val} in/hr`}
				sx={{
					'& .MuiSlider-markLabel': {
						fontSize: '0.75rem',
						whiteSpace: 'pre-line',
						textAlign: 'center',
						lineHeight: 1.2,
					},
					'& .MuiSlider-mark': {
						height: 8,
						backgroundColor: 'currentColor',
					},
					'& .MuiSlider-markActive': {
						backgroundColor: 'currentColor',
					},
				}}
			/>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ mt: 1, display: 'block' }}
			>
				Typical range: 0.3–1.0 in/hr. Use the tuna-can test to measure
				your actual rate.
			</Typography>
		</Box>
	);
}
