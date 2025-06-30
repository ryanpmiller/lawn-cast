import { ThemeProvider } from '@mui/material/styles';
import getTheme from '../theme';
import ExplanationSection from './ExplanationSection';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CalculateDecisionResult } from '../models/logic';

const meta: Meta<typeof ExplanationSection> = {
	title: 'Components/ExplanationSection',
	component: ExplanationSection,
	decorators: [
		Story => (
			<ThemeProvider theme={getTheme('light')}>
				<Story />
			</ThemeProvider>
		),
	],
};
export default meta;

type Story = StoryObj<typeof ExplanationSection>;

const noDecision: CalculateDecisionResult = {
	decision: 'no',
	totalProjected: 1.0,
	weeklyTarget: 1.0,
	progress: 1.0,
};

const yesDecision: CalculateDecisionResult = {
	decision: 'yes',
	totalProjected: 0.5,
	weeklyTarget: 1.0,
	progress: 0.5,
};

export const NoWater: Story = {
	args: {
		decision: noDecision,
		rainPast: 0.4,
		rainForecast: 0.3,
		loggedWater: 0.3,
	},
};

export const WaterToday: Story = {
	args: {
		decision: yesDecision,
		rainPast: 0.1,
		rainForecast: 0.2,
		loggedWater: 0.2,
	},
};
