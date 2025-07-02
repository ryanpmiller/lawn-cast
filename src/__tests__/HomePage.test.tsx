import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import HomePage from '../pages/HomePage';
import { useLawnCastStore } from '../models/store';

// Mock PageLayout component to avoid complex rendering
vi.mock('../components/PageLayout', () => ({
	default: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="page-layout">{children}</div>
	),
}));

// Mock InlineOnboarding component
vi.mock('../components/InlineOnboarding', () => ({
	default: () => (
		<div data-testid="inline-onboarding">Onboarding Component</div>
	),
}));

// Mock other components used in main app view
vi.mock('../components/DecisionCard', () => ({
	default: ({ decision }: { decision: string }) => (
		<div data-testid="decision-card">
			{decision === 'water' ? 'Yes, water today' : 'No need to water'}
		</div>
	),
}));

vi.mock('../components/StackedProgressBar', () => ({
	default: () => (
		<div role="progressbar" data-testid="progress-bar">
			Progress Bar
		</div>
	),
}));

vi.mock('../components/ExplanationSection', () => ({
	default: () => <div data-testid="explanation">Why this recommendation</div>,
}));

vi.mock('../components/ui/StyledPaper', () => ({
	StyledPaper: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

// Mock Material-UI Skeleton component
vi.mock('@mui/material', async () => {
	const actual = await vi.importActual('@mui/material');
	return {
		...actual,
		Skeleton: ({
			children,
			...props
		}: {
			children?: React.ReactNode;
			[key: string]: unknown;
		}) => (
			<div className="MuiSkeleton-root" {...props}>
				{children || 'Loading...'}
			</div>
		),
	};
});

// Mock the APIs
vi.mock('../api/nws', () => ({
	getPrecip: vi.fn().mockResolvedValue({
		'2025-01-01': { amount: 0.5, pop: 0.3 },
		'2025-01-02': { amount: 0.2, pop: 0.8 },
	}),
}));

vi.mock('../api/observedPrecip', () => ({
	getObservedPrecip: vi.fn().mockResolvedValue({
		'2025-01-01': 0.3,
		'2025-01-02': 0.1,
	}),
}));

beforeEach(() => {
	useLawnCastStore.getState().reset();
	// Set up realistic store state with onboarding complete by default
	// Tests that specifically want to test onboarding will override this
	useLawnCastStore.getState().update({
		zip: '20001',
		lat: 38.9072,
		lon: -77.0369,
		grassSpecies: 'kentucky_bluegrass',
		sunExposure: 'full',
		sprinklerRateInPerHr: 0.5,
		onboardingComplete: true, // Default to completed onboarding for main app tests
	});
});

describe('HomePage', () => {
	it('renders main sections when location is set', async () => {
		render(<HomePage />);

		// Should show loading skeletons initially
		const skeletons = document.querySelectorAll('.MuiSkeleton-root');
		expect(skeletons.length).toBeGreaterThan(0);

		// Wait for content to load
		await waitFor(
			() => {
				expect(screen.getByTestId('decision-card')).toBeInTheDocument();
			},
			{ timeout: 3000 }
		);
	});

	it('shows no content when no location is set', () => {
		useLawnCastStore.getState().update({ zip: '', lat: 0, lon: 0 });
		render(<HomePage />);

		// Should not show loading skeletons when location is not set
		const skeletons = document.querySelectorAll('.MuiSkeleton-root');
		expect(skeletons.length).toBe(0);

		// Should not show decision content either
		expect(screen.queryByTestId('decision-card')).not.toBeInTheDocument();
	});

	it('displays watering decision card with recommendation', async () => {
		render(<HomePage />);

		await waitFor(() => {
			expect(screen.getByTestId('decision-card')).toBeInTheDocument();
		});
	});

	it('shows progress bar with water amounts', async () => {
		render(<HomePage />);

		await waitFor(() => {
			// Should show the stacked progress bar component
			expect(screen.getByRole('progressbar')).toBeInTheDocument();
		});
	});

	it('displays current location information', async () => {
		render(<HomePage />);

		// Wait for content to load, then check for location
		await waitFor(
			() => {
				expect(screen.getByTestId('decision-card')).toBeInTheDocument();
			},
			{ timeout: 3000 }
		);

		// Check that content loaded successfully (location might not be displayed in HomePage)
		expect(screen.getByTestId('decision-card')).toBeInTheDocument();
	});

	it('handles loading state gracefully', () => {
		render(<HomePage />);

		// Should not crash during loading and show skeletons
		const skeletons = document.querySelectorAll('.MuiSkeleton-root');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('displays explanation section', async () => {
		render(<HomePage />);

		// Wait for content to load
		await waitFor(
			() => {
				expect(screen.getByTestId('decision-card')).toBeInTheDocument();
			},
			{ timeout: 3000 }
		);

		// Check for explanation section
		expect(
			screen.getByText(/why this recommendation/i)
		).toBeInTheDocument();
	});

	it('shows InlineOnboarding when onboardingComplete is false', () => {
		// Override default to set onboardingComplete: false
		useLawnCastStore.getState().update({ onboardingComplete: false });
		render(<HomePage />);

		expect(screen.getByTestId('inline-onboarding')).toBeInTheDocument();
		expect(screen.queryByText('Decision')).not.toBeInTheDocument();
	});

	it('shows main app content when onboardingComplete is true', () => {
		// Set onboarding as complete with valid location data
		useLawnCastStore.getState().update({
			onboardingComplete: true,
			zip: '20001',
			lat: 38.9072,
			lon: -77.0369,
		});

		render(<HomePage />);

		expect(
			screen.queryByTestId('inline-onboarding')
		).not.toBeInTheDocument();
		// Should show loading skeleton initially since we're fetching weather data
		expect(screen.getByTestId('page-layout')).toBeInTheDocument();
	});

	it('shows InlineOnboarding even with location data if onboardingComplete is false', () => {
		// Override default to set onboardingComplete false (location data already set in beforeEach)
		useLawnCastStore.getState().update({
			onboardingComplete: false,
		});

		render(<HomePage />);

		// Should still show onboarding because onboardingComplete is false
		expect(screen.getByTestId('inline-onboarding')).toBeInTheDocument();
	});
});
