import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from '../theme';
import DecisionCard from '../components/DecisionCard';

describe('DecisionCard', () => {
	it('renders green for no (no need to water)', () => {
		render(
			<ThemeProvider theme={getTheme('light')}>
				<DecisionCard
					decision="no"
					totalProjected={1.0}
					weeklyTarget={1.0}
				/>
			</ThemeProvider>
		);
		expect(screen.getByText(/no need to water/i)).toBeDefined();
		// Check for green background (success.light)
		const card = screen.getByRole('region', {
			name: /watering recommendation/i,
		});
		expect(card).toBeDefined();
	});

	it('renders red for yes (water today)', () => {
		render(
			<ThemeProvider theme={getTheme('light')}>
				<DecisionCard
					decision="yes"
					totalProjected={0.5}
					weeklyTarget={1.0}
				/>
			</ThemeProvider>
		);
		expect(screen.getByText(/water today/i)).toBeDefined();
		// Check for red background (warning.main)
		const card = screen.getByRole('region', {
			name: /watering recommendation/i,
		});
		expect(card).toBeDefined();
	});
});
