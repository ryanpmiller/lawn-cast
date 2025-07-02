import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useLocation,
	useNavigate,
} from 'react-router-dom';
import { useMemo } from 'react';
import { ThemeProvider, CssBaseline, Paper, Box } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SettingsIcon from '@mui/icons-material/Settings';
import HomePage from './pages/HomePage';
import LogPage from './pages/LogPage';
import SettingsPage from './pages/SettingsPage';
import getTheme from './theme';
import { useLawnCastStore } from './models/store';

function MuiBottomNav() {
	const location = useLocation();
	const navigate = useNavigate();
	const navValue =
		location.pathname === '/log'
			? 1
			: location.pathname === '/settings'
				? 2
				: 0;
	return (
		<Paper
			sx={{ position: 'fixed', left: 0, right: 0, bottom: 0 }}
			elevation={3}
		>
			<BottomNavigation
				showLabels
				value={navValue}
				onChange={(_, newValue) => {
					if (newValue === 0) navigate('/');
					if (newValue === 1) navigate('/log');
					if (newValue === 2) navigate('/settings');
				}}
				sx={{
					bgcolor: 'background.paper',
					borderTop: '1px solid #eee',
				}}
			>
				<BottomNavigationAction label="Home" icon={<HomeIcon />} />
				<BottomNavigationAction label="Log" icon={<WaterDropIcon />} />
				<BottomNavigationAction
					label="Settings"
					icon={<SettingsIcon />}
				/>
			</BottomNavigation>
		</Paper>
	);
}

function App() {
	const settings = useLawnCastStore(s => s.settings);

	// Support 'system' theme by detecting system preference
	const prefersDark = window.matchMedia(
		'(prefers-color-scheme: dark)'
	).matches;
	const themeMode =
		settings.theme === 'system'
			? prefersDark
				? 'dark'
				: 'light'
			: settings.theme;
	const theme = useMemo(
		() => getTheme(themeMode as 'light' | 'dark'),
		[themeMode]
	);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Router>
				<Box>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/log" element={<LogPage />} />
						<Route path="/settings" element={<SettingsPage />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</Box>
				<MuiBottomNav />
			</Router>
		</ThemeProvider>
	);
}

export default App;
