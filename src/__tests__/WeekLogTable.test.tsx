import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import WeekLogTable from '../components/WeekLogTable';
import { useLawnCastStore } from '../models/store';

beforeEach(() => {
	useLawnCastStore.getState().reset();
	useLawnCastStore.getState().update({
		sprinklerRateInPerHr: 0.5,
	});
});

describe('WeekLogTable', () => {
	const mockWeekDates = [
		'2025-01-01',
		'2025-01-02',
		'2025-01-03',
		'2025-01-04',
		'2025-01-05',
		'2025-01-06',
		'2025-01-07',
	];

	it('renders table with all days of the week', () => {
		render(<WeekLogTable weekDates={mockWeekDates} />);

		// Check for day headers
		expect(screen.getByText(/monday/i)).toBeInTheDocument();
		expect(screen.getByText(/tuesday/i)).toBeInTheDocument();
		expect(screen.getByText(/wednesday/i)).toBeInTheDocument();
		expect(screen.getByText(/thursday/i)).toBeInTheDocument();
		expect(screen.getByText(/friday/i)).toBeInTheDocument();
		expect(screen.getByText(/saturday/i)).toBeInTheDocument();
		expect(screen.getByText(/sunday/i)).toBeInTheDocument();
	});

	it('displays day names correctly', () => {
		render(<WeekLogTable weekDates={mockWeekDates} />);

		// Should show day names (component uses formatDayName which returns weekday names)
		expect(screen.getByText(/sunday/i)).toBeInTheDocument();
		expect(screen.getByText(/monday/i)).toBeInTheDocument();
		expect(screen.getByText(/tuesday/i)).toBeInTheDocument();
	});

	it('renders edit buttons for each day', () => {
		render(<WeekLogTable weekDates={mockWeekDates} />);

		const editButtons = screen.getAllByLabelText(/add\/edit minutes/i);
		expect(editButtons).toHaveLength(7); // One for each day
	});

	it('allows entering watering minutes through edit mode', async () => {
		render(<WeekLogTable weekDates={mockWeekDates} />);

		const editButtons = screen.getAllByLabelText(/add\/edit minutes/i);
		const firstEditButton = editButtons[0];

		// Click to enter edit mode
		await act(async () => {
			await userEvent.click(firstEditButton);
		});

		// Now should have an input field
		const input = screen.getByRole('spinbutton');
		await act(async () => {
			input.focus();
			// Use fireEvent.change to avoid NaN during clear
			fireEvent.change(input, { target: { value: '30' } });
			await userEvent.tab(); // Trigger blur to save
		});

		// Should show the entered value
		expect(screen.getByText(/30 min/i)).toBeInTheDocument();
	});

	it('saves data to store when input changes', async () => {
		render(<WeekLogTable weekDates={mockWeekDates} />);

		const editButtons = screen.getAllByLabelText(/add\/edit minutes/i);

		// Click to enter edit mode
		await act(async () => {
			await userEvent.click(editButtons[0]);
		});

		const input = screen.getByRole('spinbutton');
		await act(async () => {
			fireEvent.change(input, { target: { value: '25' } });
			await userEvent.tab(); // Save
		});

		// Check that data was saved
		const entries = useLawnCastStore.getState().entries;
		expect(entries['2025-01-01']?.minutes).toBe(25);
	});

	it('displays existing data from store', () => {
		// Pre-populate store with data
		useLawnCastStore.getState().setEntry('2025-01-01', 45);

		render(<WeekLogTable weekDates={mockWeekDates} />);

		// Should display the stored value
		expect(screen.getByText(/45 min/i)).toBeInTheDocument();
	});

	it('shows minutes for each day', async () => {
		// Pre-populate with some data
		useLawnCastStore.getState().setEntry('2025-01-01', 20);
		useLawnCastStore.getState().setEntry('2025-01-02', 30);

		render(<WeekLogTable weekDates={mockWeekDates} />);

		// Should show the entered values
		expect(screen.getByText(/20 min/i)).toBeInTheDocument();
		expect(screen.getByText(/30 min/i)).toBeInTheDocument();
	});

	it('highlights today if current week is displayed', () => {
		const today = new Date();
		const todayStr = today.toISOString().split('T')[0];

		// Create a week that includes today
		const weekWithToday = [todayStr, ...mockWeekDates.slice(1)];

		render(<WeekLogTable weekDates={weekWithToday} />);

		// Should show today's date formatted - use getAllByText since there might be multiple instances
		const todayFormatted = new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
		}).format(today);
		const todayElements = screen.getAllByText(
			new RegExp(todayFormatted, 'i')
		);
		expect(todayElements.length).toBeGreaterThanOrEqual(1);
	});

	it('handles edit mode correctly', async () => {
		render(<WeekLogTable weekDates={mockWeekDates} />);

		const editButtons = screen.getAllByLabelText(/add\/edit minutes/i);

		// Click to enter edit mode
		await act(async () => {
			await userEvent.click(editButtons[0]);
		});

		// Should show input field
		expect(screen.getByRole('spinbutton')).toBeInTheDocument();

		// Should be able to cancel with Escape
		await act(async () => {
			await userEvent.keyboard('{Escape}');
		});

		// Should exit edit mode
		expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
	});

	it('validates input ranges', async () => {
		render(<WeekLogTable weekDates={mockWeekDates} />);

		const editButtons = screen.getAllByLabelText(/add\/edit minutes/i);

		// Click to enter edit mode
		await act(async () => {
			await userEvent.click(editButtons[0]);
		});

		const input = screen.getByRole('spinbutton');

		// Input should have min/max constraints
		expect(input).toHaveAttribute('min', '0');
		expect(input).toHaveAttribute('max', '240');
	});
});
