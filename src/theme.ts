import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark'): Theme =>
	createTheme({
		palette: {
			mode,
			primary: { main: '#4A7C59' },
			secondary: { main: '#FFB74D' },
			background: {
				default: mode === 'light' ? '#F5F5F5' : '#242424',
				paper: mode === 'light' ? '#fff' : '#1a1a1a',
			},
			success: {
				main: '#4A7C59',
				light: '#B7D7C2',
				dark: '#355C3A',
				contrastText: '#fff',
			},
			warning: {
				main: '#FFB74D',
				light: '#FFE9CA',
				dark: '#C88719',
				contrastText: '#fff',
			},
			error: {
				main: '#b00020',
				light: '#f2b8b5',
				dark: '#7f0015',
				contrastText: '#fff',
			},
			divider: mode === 'light' ? '#E0E0E0' : '#333',
			text: {
				primary: mode === 'light' ? '#213547' : '#fff',
				secondary: mode === 'light' ? '#6e7b8a' : '#cdcdcd',
			},
		},
		shape: {
			borderRadius: 12,
		},
		typography: {
			fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
			fontWeightRegular: 400,
			fontWeightMedium: 500,
			fontWeightBold: 700,
		},
		components: {
			MuiPaper: {
				styleOverrides: {
					root: {
						transition: 'none',
					},
				},
			},
		},
	});

export default getTheme;
