import {
	render,
	screen,
	fireEvent,
	waitFor,
	act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import InlineOnboarding from '../components/InlineOnboarding';
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

describe('InlineOnboarding', () => {
	it('renders the welcome message and stepper', () => {
		render(<InlineOnboarding />);

		// Check for welcome message
		expect(screen.getByText('Welcome to LawnCast!')).toBeInTheDocument();
		expect(
			screen.getByText(
				"Let's get your lawn care setup in just a few steps."
			)
		).toBeInTheDocument();

		// Check for stepper with all steps
		expect(screen.getByText('Location')).toBeInTheDocument();
		expect(screen.getByText('Lawn Details')).toBeInTheDocument();
		expect(screen.getByText('Sprinkler Setup')).toBeInTheDocument();
		expect(screen.getByText('Notifications')).toBeInTheDocument();
	});

	it('renders step 0 location setup initially', () => {
		render(<InlineOnboarding />);

		expect(screen.getByText('Set Your Location')).toBeInTheDocument();
		expect(
			screen.getByText(/to provide accurate watering recommendations/i)
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /use my current location/i })
		).toBeInTheDocument();
		expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
	});

	it('validates ZIP code format', async () => {
		render(<InlineOnboarding />);

		const zipInput = screen.getByLabelText(/zip code/i);
		const continueButton = screen.getByRole('button', {
			name: /continue/i,
		});

		// Enter invalid ZIP
		await act(async () => {
			await userEvent.type(zipInput, '123');
			fireEvent.click(continueButton);
		});

		expect(screen.getByText(/valid 5-digit zip code/i)).toBeInTheDocument();
	});

	it('proceeds to step 1 with valid ZIP', async () => {
		render(<InlineOnboarding />);

		const zipInput = screen.getByLabelText(/zip code/i);
		const continueButton = screen.getByRole('button', {
			name: /continue/i,
		});

		// Enter valid ZIP
		await act(async () => {
			await userEvent.type(zipInput, '20001');
			fireEvent.click(continueButton);
		});

		await waitFor(() => {
			expect(
				screen.getByRole('heading', { name: 'Lawn Details' })
			).toBeInTheDocument();
			expect(
				screen.getByText(/how much sun does your lawn get/i)
			).toBeInTheDocument();
		});
	});

	it('allows selecting sun exposure in step 1', async () => {
		render(<InlineOnboarding />);

		// Navigate to step 1
		const zipInput = screen.getByLabelText(/zip code/i);
		await act(async () => {
			await userEvent.type(zipInput, '20001');
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
		render(<InlineOnboarding />);

		// Navigate to step 1
		const zipInput = screen.getByLabelText(/zip code/i);
		await act(async () => {
			await userEvent.type(zipInput, '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			// Check for the select element specifically
			expect(
				screen.getByRole('combobox', { name: /grass species/i })
			).toBeInTheDocument();
		});
	});

	it('can navigate back to previous step', async () => {
		render(<InlineOnboarding />);

		// Navigate to step 1
		const zipInput = screen.getByLabelText(/zip code/i);
		await act(async () => {
			await userEvent.type(zipInput, '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			expect(
				screen.getByRole('heading', { name: 'Lawn Details' })
			).toBeInTheDocument();
		});

		// Click back button
		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: /back/i }));
		});

		// Should be back to step 0
		expect(screen.getByText('Set Your Location')).toBeInTheDocument();
	});

	it('proceeds to step 2 sprinkler calibration', async () => {
		render(<InlineOnboarding />);

		// Navigate through steps
		const zipInput = screen.getByLabelText(/zip code/i);
		await act(async () => {
			await userEvent.type(zipInput, '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 1: Continue to step 2
		await waitFor(() => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			expect(
				screen.getByText('Sprinkler Calibration')
			).toBeInTheDocument();
			expect(
				screen.getAllByText(/tuna-can test/i)[0]
			).toBeInTheDocument();
		});
	});

	it('shows sprinkler rate slider', async () => {
		render(<InlineOnboarding />);

		// Navigate to step 2
		const zipInput = screen.getByLabelText(/zip code/i);
		await act(async () => {
			await userEvent.type(zipInput, '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			// Check for slider presence
			const slider = screen.getByRole('slider');
			expect(slider).toBeInTheDocument();

			// Check for sprinkler rate label
			expect(screen.getByText(/sprinkler rate:/i)).toBeInTheDocument();
			expect(screen.getByText(/0.5 in\/hr/)).toBeInTheDocument();
		});
	});

	it('allows adjusting sprinkler rate with slider', async () => {
		render(<InlineOnboarding />);

		// Navigate to sprinkler step
		const zipInput = screen.getByLabelText(/zip code/i);
		await act(async () => {
			await userEvent.type(zipInput, '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 1: Continue to step 2
		await waitFor(() => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 2: Should show slider
		await waitFor(() => {
			expect(screen.getByRole('slider')).toBeInTheDocument();
		});

		// Interact with slider to change value
		const slider = screen.getByRole('slider');
		await act(async () => {
			// Simulate changing slider value to 0.75
			fireEvent.change(slider, { target: { value: '0.75' } });
		});

		// Check that the label was updated
		await waitFor(() => {
			expect(screen.getByText(/sprinkler rate:/i)).toBeInTheDocument();
			expect(screen.getByText(/0.75 in\/hr/)).toBeInTheDocument();
		});

		// Check that settings were saved
		const settings = useLawnCastStore.getState().settings;
		expect(settings.sprinklerRateInPerHr).toBe(0.75);
	});

	it('proceeds to step 3 notifications', async () => {
		render(<InlineOnboarding />);

		// Navigate through all steps to notifications
		const zipInput = screen.getByLabelText(/zip code/i);
		await act(async () => {
			await userEvent.type(zipInput, '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 1: Continue to step 2
		await waitFor(() => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 2: Set sprinkler rate and continue to step 3
		await waitFor(() => {
			const slider = screen.getByRole('slider');
			fireEvent.change(slider, { target: { value: '0.8' } });
		});

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 3: Should show notifications step
		await waitFor(() => {
			expect(
				screen.getByRole('heading', { name: 'Notifications' })
			).toBeInTheDocument();
			expect(
				screen.getByText(/enable notifications/i)
			).toBeInTheDocument();
		});
	});

	it('allows enabling notifications and setting time', async () => {
		render(<InlineOnboarding />);

		// Navigate to notifications step
		const zipInput = screen.getByLabelText(/zip code/i);
		await act(async () => {
			await userEvent.type(zipInput, '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		await waitFor(() => {
			const slider = screen.getByRole('slider');
			fireEvent.change(slider, { target: { value: '0.8' } });
		});

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Enable notifications
		await waitFor(() => {
			const notificationSwitch = screen.getByRole('checkbox', {
				name: /enable notifications/i,
			});
			fireEvent.click(notificationSwitch);
		});

		// Check that time selector appears
		await waitFor(() => {
			expect(
				screen.getByLabelText(/notification time/i)
			).toBeInTheDocument();
		});
	});

	it('completes onboarding and saves settings', async () => {
		render(<InlineOnboarding />);

		// Complete full flow
		const zipInput = screen.getByLabelText(/zip code/i);
		await act(async () => {
			await userEvent.type(zipInput, '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 1: Continue to step 2
		await waitFor(() => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 2: Set sprinkler rate and continue to step 3
		await waitFor(() => {
			const slider = screen.getByRole('slider');
			fireEvent.change(slider, { target: { value: '0.8' } });
		});

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Step 3: Complete onboarding
		await waitFor(() => {
			fireEvent.click(
				screen.getByRole('button', { name: /get started!/i })
			);
		});

		// Check that settings were saved
		const settings = useLawnCastStore.getState().settings;
		expect(settings.zip).toBe('20001');
		expect(settings.sprinklerRateInPerHr).toBe(0.8);
		expect(settings.onboardingComplete).toBe(true);
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

		render(<InlineOnboarding />);

		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /use my current location/i })
			);
		});

		await waitFor(
			() => {
				// Should show error message after geolocation fails
				expect(
					screen.getByText(
						/location permission denied or unavailable/i
					)
				).toBeInTheDocument();
			},
			{ timeout: 3000 }
		);
	});

	it('handles successful geolocation', async () => {
		// Mock successful geolocation
		Object.defineProperty(global.navigator, 'geolocation', {
			value: {
				getCurrentPosition: vi.fn().mockImplementation(success => {
					setTimeout(
						() =>
							success({
								coords: {
									latitude: 38.9072,
									longitude: -77.0369,
								},
							}),
						100
					);
				}),
			},
			writable: true,
		});

		render(<InlineOnboarding />);

		await act(async () => {
			fireEvent.click(
				screen.getByRole('button', { name: /use my current location/i })
			);
		});

		await waitFor(
			() => {
				// Should proceed to step 1 after successful geolocation
				expect(
					screen.getByRole('heading', { name: 'Lawn Details' })
				).toBeInTheDocument();
			},
			{ timeout: 3000 }
		);

		// Check that settings were saved
		const settings = useLawnCastStore.getState().settings;
		expect(settings.zip).toBe('20001');
		expect(settings.lat).toBeCloseTo(38.9072);
		expect(settings.lon).toBeCloseTo(-77.0369);
	});

	it('saves settings progressively during onboarding', async () => {
		render(<InlineOnboarding />);

		// Step 0: Set location
		const zipInput = screen.getByLabelText(/zip code/i);
		await act(async () => {
			await userEvent.type(zipInput, '20001');
			fireEvent.click(screen.getByRole('button', { name: /continue/i }));
		});

		// Check location was saved
		let settings = useLawnCastStore.getState().settings;
		expect(settings.zip).toBe('20001');

		// Step 1: Set sun exposure
		await waitFor(() => {
			const fullSunButton = screen.getByRole('button', {
				name: /full sun/i,
			});
			fireEvent.click(fullSunButton);
		});

		// Check sun exposure was saved
		settings = useLawnCastStore.getState().settings;
		expect(settings.sunExposure).toBe('full');

		// Step 1: Set grass species
		await waitFor(() => {
			const speciesSelect = screen.getByRole('combobox', {
				name: /grass species/i,
			});
			fireEvent.change(speciesSelect, {
				target: { value: 'tall_fescue' },
			});
		});

		// Check grass species was saved
		settings = useLawnCastStore.getState().settings;
		expect(settings.grassSpecies).toBe('tall_fescue');
	});
});
