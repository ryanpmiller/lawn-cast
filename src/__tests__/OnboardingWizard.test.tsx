import {
	render,
	screen,
	fireEvent,
	waitFor,
	act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import OnboardingWizard from '../components/OnboardingWizard';
import { useLawnCastStore } from '../models/store';

// Mock the nominatim API
vi.mock('../api/nominatim', () => ({
	searchZipAutocomplete: vi.fn().mockResolvedValue([
		{
			address: {
				postcode: '20001',
				city: 'Washington',
				state: 'DC',
				country: 'United States',
			},
			lat: '38.9072',
			lon: '-77.0369',
		},
	]),
}));

beforeEach(() => {
	useLawnCastStore.getState().reset();
});

describe('OnboardingWizard', () => {
	const mockOnClose = vi.fn();

	beforeEach(() => {
		mockOnClose.mockClear();
	});

	it('renders step 1 location setup initially', () => {
		render(<OnboardingWizard open={true} onClose={mockOnClose} />);

		expect(
			screen.getByText(/step 1: set your location/i)
		).toBeInTheDocument();
		expect(
			screen.getByText(/to personalize your watering advice/i)
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /allow location access/i })
		).toBeInTheDocument();
	});

	it('allows manual ZIP entry', async () => {
		render(<OnboardingWizard open={true} onClose={mockOnClose} />);

		// Click manual ZIP entry
		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /enter zip manually/i })
			);
		});

		expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
	});

	it('validates ZIP code format', async () => {
		render(<OnboardingWizard open={true} onClose={mockOnClose} />);

		// Go to manual ZIP entry
		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /enter zip manually/i })
			);
		});

		const zipInput = screen.getByLabelText(/zip code/i);

		// Enter invalid ZIP
		await act(async () => {
			await userEvent.type(zipInput, '123');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		expect(screen.getByText(/valid 5-digit zip code/i)).toBeInTheDocument();
	});

	it('proceeds to step 2 with valid ZIP', async () => {
		render(<OnboardingWizard open={true} onClose={mockOnClose} />);

		// Go to manual ZIP entry
		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /enter zip manually/i })
			);
		});

		const zipInput = screen.getByLabelText(/zip code/i);

		// Enter valid ZIP
		await act(async () => {
			await userEvent.type(zipInput, '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			expect(
				screen.getByText(/step 2: sun exposure & grass species/i)
			).toBeInTheDocument();
		});
	});

	it('allows selecting sun exposure in step 2', async () => {
		render(<OnboardingWizard open={true} onClose={mockOnClose} />);

		// Navigate to step 2 (mocking successful ZIP lookup)
		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /enter zip manually/i })
			);
		});

		await act(async () => {
			await userEvent.type(screen.getByLabelText(/zip code/i), '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			expect(
				screen.getByText(/how much sun does your lawn get/i)
			).toBeInTheDocument();
		});

		// Select sun exposure
		const partialSunButton = screen.getByRole('button', {
			name: /partial shade/i,
		});
		await act(async () => {
			fireEvent.click(partialSunButton);
		});

		expect(partialSunButton).toHaveClass('MuiButton-contained');
	});

	it('shows grass species options based on sun selection', async () => {
		render(<OnboardingWizard open={true} onClose={mockOnClose} />);

		// Navigate to step 2
		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /enter zip manually/i })
			);
		});

		await act(async () => {
			await userEvent.type(screen.getByLabelText(/zip code/i), '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			// Check for the select element specifically
			expect(
				screen.getByRole('combobox', { name: /grass species/i })
			).toBeInTheDocument();
		});
	});

	it('proceeds to step 3 sprinkler calibration', async () => {
		render(<OnboardingWizard open={true} onClose={mockOnClose} />);

		// Navigate through steps
		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /enter zip manually/i })
			);
		});

		await act(async () => {
			await userEvent.type(screen.getByLabelText(/zip code/i), '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			expect(
				screen.getByText(/step 3: sprinkler calibration/i)
			).toBeInTheDocument();
			expect(screen.getByText(/tuna-can test/i)).toBeInTheDocument();
		});
	});

	it('validates sprinkler rate input', async () => {
		render(<OnboardingWizard open={true} onClose={mockOnClose} />);

		// Navigate to step 3
		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /enter zip manually/i })
			);
		});

		await act(async () => {
			await userEvent.type(screen.getByLabelText(/zip code/i), '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			const rateInput = screen.getByLabelText(/sprinkler rate/i);
			expect(rateInput).toBeInTheDocument();
		});

		// Test invalid rate
		const rateInput = screen.getByLabelText(/sprinkler rate/i);
		await act(async () => {
			// Use fireEvent.change to avoid NaN state during clearing
			fireEvent.change(rateInput, { target: { value: '5' } }); // Too high
		});

		await waitFor(() => {
			expect(
				screen.getByText(/enter a value between 0.1 and 2.0/i)
			).toBeInTheDocument();
		});
	});

	it('completes onboarding and saves settings', async () => {
		render(<OnboardingWizard open={true} onClose={mockOnClose} />);

		// Complete full flow
		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /enter zip manually/i })
			);
		});

		await act(async () => {
			await userEvent.type(screen.getByLabelText(/zip code/i), '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 2: Continue to step 3
		await waitFor(() => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 3: Set sprinkler rate and continue to step 4
		await waitFor(() => {
			const rateInput = screen.getByLabelText(/sprinkler rate/i);
			fireEvent.change(rateInput, { target: { value: '0.8' } });
		});

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 4: Should show notifications step and finish button
		await waitFor(() => {
			expect(
				screen.getByText(/step 4.*notifications/i)
			).toBeInTheDocument();
		});

		await waitFor(() => {
			fireEvent.click(screen.getByRole('button', { name: /finish/i }));
		});

		// Check that settings were saved
		const settings = useLawnCastStore.getState().settings;
		expect(settings.zip).toBe('20001');
		expect(mockOnClose).toHaveBeenCalled();
	});

	it('allows skipping onboarding', async () => {
		render(<OnboardingWizard open={true} onClose={mockOnClose} />);

		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /skip for now/i })
			);
		});

		expect(mockOnClose).toHaveBeenCalled();
	});

	it('handles geolocation permission denied', async () => {
		// Mock geolocation failure
		Object.defineProperty(global.navigator, 'geolocation', {
			value: {
				getCurrentPosition: vi
					.fn()
					.mockImplementation((_success, error) => {
						setTimeout(
							() => error(new Error('Permission denied')),
							100
						);
					}),
			},
			writable: true,
		});

		render(<OnboardingWizard open={true} onClose={mockOnClose} />);

		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /allow location access/i })
			);
		});

		await waitFor(
			() => {
				// Should show the ZIP input after geolocation fails
				expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
				// Should show the manual ZIP entry text
				expect(
					screen.getByText(/enter your zip code/i)
				).toBeInTheDocument();
			},
			{ timeout: 3000 }
		);
	});
});
