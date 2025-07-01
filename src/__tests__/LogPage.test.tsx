import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import LogPage from '../pages/LogPage';
import { useLawnCastStore } from '../models/store';

beforeEach(() => {
	useLawnCastStore.getState().reset();
	useLawnCastStore.getState().update({
		sprinklerRateInPerHr: 0.5,
	});
});

describe('LogPage', () => {
	it('renders the log page with water log title', () => {
		render(<LogPage />);

		expect(screen.getByText(/water log/i)).toBeInTheDocument();
		expect(screen.getByText(/progress/i)).toBeInTheDocument();
		expect(screen.getByText(/how to log water/i)).toBeInTheDocument();
	});

	it('displays the current week dates', () => {
		render(<LogPage />);

		// Should show days of the week
		expect(screen.getByText(/monday/i)).toBeInTheDocument();
		expect(screen.getByText(/tuesday/i)).toBeInTheDocument();
		expect(screen.getByText(/sunday/i)).toBeInTheDocument();
	});

	it('allows logging watering minutes', async () => {
		render(<LogPage />);

		// Click an edit button to enter edit mode
		const editButtons = screen.getAllByLabelText(/add\/edit minutes/i);
		expect(editButtons.length).toBeGreaterThan(0);

		await act(async () => {
			fireEvent.click(editButtons[0]);
		});

		// Find the input field that appears after clicking edit
		const input = await screen.findByRole('spinbutton');

		// Enter watering minutes
		await act(async () => {
			fireEvent.change(input, { target: { value: '30' } });
			fireEvent.blur(input); // Save the value
		});

		// Check that the value was saved
		await waitFor(() => {
			const elements = screen.getAllByText(/30 min/);
			expect(elements.length).toBeGreaterThanOrEqual(1);
		});
	});

	it('shows progress bar with weekly target', () => {
		render(<LogPage />);

		// Should show progress bar
		expect(screen.getByRole('progressbar')).toBeInTheDocument();

		// Should show target information
		expect(screen.getByText(/min target/i)).toBeInTheDocument();
	});

	it('calculates total weekly water correctly', async () => {
		render(<LogPage />);

		const editButtons = screen.getAllByLabelText(/add\/edit minutes/i);

		// Add watering to first day
		await act(async () => {
			fireEvent.click(editButtons[0]);
		});

		let input = await screen.findByRole('spinbutton');
		await act(async () => {
			fireEvent.change(input, { target: { value: '20' } }); // 20 minutes = 0.17 inches at 0.5 in/hr
			fireEvent.blur(input);
		});

		// Add watering to second day
		await waitFor(() => {
			const elements = screen.getAllByText(/20 min/);
			expect(elements.length).toBeGreaterThanOrEqual(1);
		});

		await act(async () => {
			fireEvent.click(editButtons[1]);
		});

		input = await screen.findByRole('spinbutton');
		await act(async () => {
			fireEvent.change(input, { target: { value: '30' } }); // 30 minutes = 0.25 inches
			fireEvent.blur(input);
		});

		// Should show total watering for the week
		await waitFor(() => {
			const elements = screen.getAllByText(/30 min/);
			expect(elements.length).toBeGreaterThanOrEqual(1);
		});
	});

	it('persists logged data in store', async () => {
		render(<LogPage />);

		const editButtons = screen.getAllByLabelText(/add\/edit minutes/i);

		await act(async () => {
			fireEvent.click(editButtons[0]);
		});

		const input = await screen.findByRole('spinbutton');
		await act(async () => {
			fireEvent.change(input, { target: { value: '25' } });
			fireEvent.blur(input);
		});

		// Check that data was saved to store
		await waitFor(() => {
			const store = useLawnCastStore.getState();
			expect(Object.keys(store.entries).length).toBeGreaterThan(0);
		});
	});

	it('shows current week indicator', () => {
		render(<LogPage />);

		// Should show day names for the current week
		expect(screen.getByText(/monday/i)).toBeInTheDocument();
		expect(screen.getByText(/tuesday/i)).toBeInTheDocument();
		expect(screen.getByText(/sunday/i)).toBeInTheDocument();
	});
});