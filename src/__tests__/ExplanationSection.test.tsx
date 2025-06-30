import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from '../theme';
import ExplanationSection from '../components/ExplanationSection';
import type { CalculateDecisionResult } from '../models/logic';

describe('ExplanationSection', () => {
	const noDecision: CalculateDecisionResult = {
		decision: 'no',
		totalProjected: 1.0,
		weeklyTarget: 1.0,
		progress: 1.0,
	};
	const yesDecision: CalculateDecisionResult = {
		decision: 'yes',
		totalProjected: 0.5,
		weeklyTarget: 1.0,
		progress: 0.5,
	};

	it('renders correct explanation and breakdown for no (no need to water)', () => {
		render(
			<ThemeProvider theme={getTheme('light')}>
				<ExplanationSection
					decision={noDecision}
					rainPast={0.4}
					rainForecast={0.3}
					loggedWater={0.3}
				/>
			</ThemeProvider>
		);
		expect(
			screen.getByText(/you've met your lawn's weekly water needs/i)
		).toBeDefined();
		expect(screen.getByText('Rain')).toBeDefined();
		expect(screen.getByText('0.40"')).toBeDefined();
		expect(screen.getByText('Forecast')).toBeDefined();
		expect(screen.getByText('Logged')).toBeDefined();
		expect(screen.getByText(/weekly target: 1.00"/i)).toBeDefined();
		expect(screen.getByText(/total projected: 1.00"/i)).toBeDefined();
		expect(screen.getAllByText('0.30"')).toHaveLength(2);
	});

	it('renders correct explanation and breakdown for yes (water today)', () => {
		render(
			<ThemeProvider theme={getTheme('light')}>
				<ExplanationSection
					decision={yesDecision}
					rainPast={0.1}
					rainForecast={0.2}
					loggedWater={0.2}
				/>
			</ThemeProvider>
		);
		expect(
			screen.getByText(
				/your lawn is projected to be below its weekly water target/i
			)
		).toBeDefined();
		expect(screen.getByText('Rain')).toBeDefined();
		expect(screen.getByText('0.10"')).toBeDefined();
		expect(screen.getByText('Forecast')).toBeDefined();
		expect(screen.getByText('Logged')).toBeDefined();
		expect(screen.getByText(/weekly target: 1.00"/i)).toBeDefined();
		expect(screen.getByText(/total projected: 0.50"/i)).toBeDefined();
		expect(screen.getAllByText('0.20"')).toHaveLength(2);
	});
});
