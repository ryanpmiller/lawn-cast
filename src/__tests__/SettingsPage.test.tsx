import {
	render,
	screen,
	fireEvent,
	waitFor,
	act,
} from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import SettingsPage from '../pages/SettingsPage';
import { useLawnCastStore } from '../models/store';

beforeEach(() => {
	useLawnCastStore.getState().reset();
});

describe('SettingsPage form/state sync', () => {
	it('updates ZIP and reflects in store', async () => {
		render(<SettingsPage />);
		const input = screen.getByLabelText(/update zip code/i);
		fireEvent.change(input, { target: { value: '90210' } });
		fireEvent.blur(input);
		await waitFor(() =>
			expect(useLawnCastStore.getState().settings.zip).toBe('90210')
		);
	});

	it('updates grass species and sun exposure', async () => {
		render(<SettingsPage />);
		const species = screen.getByLabelText(/grass species/i);
		const sun = screen.getByLabelText(/sun exposure/i);
		await act(async () => {
			await userEvent.click(species);
			await userEvent.click(
				screen.getByRole('option', { name: /bermuda/i })
			);
			await userEvent.click(sun);
			await userEvent.click(
				screen.getByRole('option', { name: /full shade/i })
			);
		});
		expect(useLawnCastStore.getState().settings.grassSpecies).toBe(
			'bermuda'
		);
		expect(useLawnCastStore.getState().settings.sunExposure).toBe('shade');
	});

	it('updates sprinkler rate', () => {
		render(<SettingsPage />);
		const input = screen.getByLabelText(/sprinkler rate/i);
		fireEvent.change(input, { target: { value: '1.2' } });
		expect(useLawnCastStore.getState().settings.sprinklerRateInPerHr).toBe(
			1.2
		);
	});

	it('updates theme', () => {
		render(<SettingsPage />);
		const darkBtn = screen.getByRole('button', { name: /dark/i });
		fireEvent.click(darkBtn);
		expect(useLawnCastStore.getState().settings.theme).toBe('dark');
	});

	it('updates notifications and hour', async () => {
		render(<SettingsPage />);
		const toggle = screen.getByLabelText(/enable notifications/i);
		await act(async () => {
			await userEvent.click(toggle);
		});
		const hour = screen.getByLabelText(/notification time/i);
		await act(async () => {
			await userEvent.click(hour);
			await userEvent.click(
				screen.getByRole('option', { name: /7:00 am/i })
			);
		});
		expect(useLawnCastStore.getState().settings.notificationHour).toBe(7);
	});

	it('clears all data in DangerZone', async () => {
		render(<SettingsPage />);
		// Set some state
		useLawnCastStore.getState().update({ zip: '99999' });
		const btn = screen.getByRole('button', { name: /clear all data/i });
		fireEvent.click(btn);
		const confirm = await screen.findByRole('button', {
			name: /clear all data/i,
		});
		fireEvent.click(confirm);
		await waitFor(() =>
			expect(useLawnCastStore.getState().settings.zip).toBe('')
		);
	});
});
