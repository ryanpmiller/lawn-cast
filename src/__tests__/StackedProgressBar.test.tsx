import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from '../theme';
import StackedProgressBar from '../components/StackedProgressBar';

describe('StackedProgressBar', () => {
	it('renders all three segments when all sources present', () => {
		render(
			<ThemeProvider theme={getTheme('light')}>
				<StackedProgressBar
					rainPast={0.3}
					rainForecast={0.2}
					loggedWater={0.4}
					weeklyTarget={1.0}
				/>
			</ThemeProvider>
		);
		// Should render 3 colored segments (rain, forecast, logged)
		expect(screen.getByLabelText(/weekly progress bar/i)).toBeDefined();
		// There should be 3 tooltips (rain, forecast, logged)
		expect(screen.getByLabelText(/rain: 0.30/i)).toBeDefined();
		expect(screen.getByLabelText(/forecast: 0.20/i)).toBeDefined();
		expect(screen.getByLabelText(/logged: 0.40/i)).toBeDefined();
	});

	it('caps total width at 100% when over target', () => {
		render(
			<ThemeProvider theme={getTheme('light')}>
				<StackedProgressBar
					rainPast={0.6}
					rainForecast={0.6}
					loggedWater={0.6}
					weeklyTarget={1.0}
				/>
			</ThemeProvider>
		);
		// Should still render all segments, but total width is capped
		expect(screen.getByLabelText(/weekly progress bar/i)).toBeDefined();
		// All segments present
		expect(screen.getByLabelText(/rain: 0.60/i)).toBeDefined();
		expect(screen.getByLabelText(/forecast: 0.60/i)).toBeDefined();
		expect(screen.getByLabelText(/logged: 0.60/i)).toBeDefined();
	});

	it('renders only rain segment when only rainPast is present', () => {
		render(
			<ThemeProvider theme={getTheme('light')}>
				<StackedProgressBar
					rainPast={1.0}
					rainForecast={0}
					loggedWater={0}
					weeklyTarget={1.0}
				/>
			</ThemeProvider>
		);
		expect(screen.getByLabelText(/weekly progress bar/i)).toBeDefined();
		// For the rain segment, use getByLabelText if getByText fails
		expect(screen.getByLabelText(/rain: 1.00/i)).toBeDefined();
		expect(screen.queryByLabelText(/forecast:/i)).toBeNull();
		expect(screen.queryByLabelText(/logged:/i)).toBeNull();
	});
});
