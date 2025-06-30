import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { useLawnCastStore } from '../models/store';

describe('App', () => {
	it('renders without crashing', () => {
		// Mock settings.zone so onboarding does not open
		useLawnCastStore.setState({
			settings: { ...useLawnCastStore.getState().settings, zone: 'cool' },
		});
		render(<App />);
		expect(screen.getByRole('button', { name: /home/i })).toBeDefined();
	});
});

beforeAll(() => {
	window.matchMedia =
		window.matchMedia ||
		function () {
			return {
				matches: false,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				addListener: vi.fn(),
				removeListener: vi.fn(),
				dispatchEvent: vi.fn(),
			};
		};
});
