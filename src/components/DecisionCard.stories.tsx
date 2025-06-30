import { ThemeProvider } from '@mui/material/styles';
import getTheme from '../theme';
import DecisionCard from './DecisionCard';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof DecisionCard> = {
	title: 'Components/DecisionCard',
	component: DecisionCard,
	decorators: [
		Story => (
			<ThemeProvider theme={getTheme('light')}>
				<Story />
			</ThemeProvider>
		),
	],
};
export default meta;

type Story = StoryObj<typeof DecisionCard>;

export const NoWater: Story = {
	args: {
		decision: 'no',
		totalProjected: 1.0,
		weeklyTarget: 1.0,
	},
};

export const WaterToday: Story = {
	args: {
		decision: 'yes',
		totalProjected: 0.5,
		weeklyTarget: 1.0,
	},
};
