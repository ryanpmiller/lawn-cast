import { ThemeProvider } from '@mui/material/styles';
import getTheme from '../theme';
import StackedProgressBar from './StackedProgressBar';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof StackedProgressBar> = {
	title: 'Components/StackedProgressBar',
	component: StackedProgressBar,
	decorators: [
		Story => (
			<ThemeProvider theme={getTheme('light')}>
				<Story />
			</ThemeProvider>
		),
	],
};
export default meta;

type Story = StoryObj<typeof StackedProgressBar>;

export const AllSources: Story = {
	args: {
		rainPast: 0.3,
		rainForecast: 0.2,
		loggedWater: 0.4,
		weeklyTarget: 1.0,
	},
};

export const RainOnly: Story = {
	args: {
		rainPast: 1.0,
		rainForecast: 0,
		loggedWater: 0,
		weeklyTarget: 1.0,
	},
};

export const ForecastOnly: Story = {
	args: {
		rainPast: 0,
		rainForecast: 1.0,
		loggedWater: 0,
		weeklyTarget: 1.0,
	},
};

export const LoggedOnly: Story = {
	args: {
		rainPast: 0,
		rainForecast: 0,
		loggedWater: 1.0,
		weeklyTarget: 1.0,
	},
};

export const OverTarget: Story = {
	args: {
		rainPast: 0.6,
		rainForecast: 0.6,
		loggedWater: 0.6,
		weeklyTarget: 1.0,
	},
};
