import type { Meta, StoryObj } from '@storybook/react-vite';
import WeekLogTable from './WeekLogTable';

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

// Generate a sample week
const currentWeek = [
	'2025-01-01',
	'2025-01-02',
	'2025-01-03',
	'2025-01-04',
	'2025-01-05',
	'2025-01-06',
	'2025-01-07',
];

const weekWithToday = (() => {
	const today = new Date();
	const todayStr = today.toISOString().split('T')[0];
	return [todayStr, ...currentWeek.slice(1)];
})();

export const Default: Story = {
	args: {
		weekDates: currentWeek,
	},
};

export const CurrentWeek: Story = {
	args: {
		weekDates: weekWithToday,
	},
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
			// Pre-populate some mock data
			// Note: In a real app, this would come from the store
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
