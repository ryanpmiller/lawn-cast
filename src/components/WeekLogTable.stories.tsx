import type { Meta, StoryObj } from '@storybook/react-vite';
import WeekLogTable from './WeekLogTable';
import { getWeekDates } from '../utils/dateUtils';
import { useLawnCastStore } from '../models/store';

const meta: Meta<typeof WeekLogTable> = {
	title: 'Components/WeekLogTable',
	component: WeekLogTable,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		weekDates: {
			description: 'Array of date strings for the week',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate a proper Sunday-Saturday week using the same utility function as the app
const currentWeek = getWeekDates();

export const Default: Story = {
	args: {
		weekDates: currentWeek,
	},
	decorators: [
		Story => {
			// Clear any existing entries to ensure clean state
			const store = useLawnCastStore.getState();
			currentWeek.forEach(date => store.setEntry(date, 0));
			return <Story />;
		},
	],
};

export const CurrentWeek: Story = {
	args: {
		weekDates: currentWeek,
	},
	decorators: [
		Story => {
			// Clear any existing entries to ensure clean state
			const store = useLawnCastStore.getState();
			currentWeek.forEach(date => store.setEntry(date, 0));
			return <Story />;
		},
	],
	parameters: {
		docs: {
			description: {
				story: 'Shows the current week with today highlighted.',
			},
		},
	},
};

export const EmptyWeek: Story = {
	args: {
		weekDates: currentWeek,
	},
	decorators: [
		Story => {
			// Clear any existing entries to ensure clean state
			const store = useLawnCastStore.getState();
			currentWeek.forEach(date => store.setEntry(date, 0));
			return <Story />;
		},
	],
	parameters: {
		docs: {
			description: {
				story: 'A week with no watering logged yet.',
			},
		},
	},
};

export const PartiallyFilledWeek: Story = {
	args: {
		weekDates: currentWeek,
	},
	decorators: [
		Story => {
			// Clear any existing entries first, then add sample data
			const store = useLawnCastStore.getState();

			// Clear all entries for this week first
			currentWeek.forEach(date => store.setEntry(date, 0));

			// Add sample watering entries for a few days
			store.setEntry(currentWeek[1], 25); // Monday: 25 minutes
			store.setEntry(currentWeek[3], 30); // Wednesday: 30 minutes
			store.setEntry(currentWeek[5], 20); // Friday: 20 minutes

			return <Story />;
		},
	],
	parameters: {
		docs: {
			description: {
				story: 'A week with some watering entries already logged.',
			},
		},
	},
};
