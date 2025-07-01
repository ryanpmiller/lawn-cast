import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Typography } from '@mui/material';
import { StyledPaper } from './StyledPaper';

const meta: Meta<typeof StyledPaper> = {
	title: 'Components/UI/StyledPaper',
	component: StyledPaper,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: { type: 'select' },
			options: ['card', 'progress', 'section'],
			description: 'The visual variant of the paper component',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {
	args: {
		variant: 'card',
		children: (
			<Box>
				<Typography variant="h6" gutterBottom>
					Card Variant
				</Typography>
				<Typography variant="body2">
					This is the card variant used for main content areas with
					elevated appearance.
				</Typography>
			</Box>
		),
	},
};

export const Progress: Story = {
	args: {
		variant: 'progress',
		children: (
			<Box>
				<Typography variant="h6" gutterBottom>
					Progress Variant
				</Typography>
				<Typography variant="body2">
					This variant is used for progress indicators and status
					displays.
				</Typography>
			</Box>
		),
	},
};

export const Section: Story = {
	args: {
		variant: 'section',
		children: (
			<Box>
				<Typography variant="h6" gutterBottom>
					Section Variant
				</Typography>
				<Typography variant="body2">
					This variant is used for section containers and grouping
					related content.
				</Typography>
			</Box>
		),
	},
};

export const AllVariants: Story = {
	render: () => (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<StyledPaper variant="card">
				<Typography variant="h6">Card</Typography>
				<Typography variant="body2">
					Elevated card appearance
				</Typography>
			</StyledPaper>

			<StyledPaper variant="progress">
				<Typography variant="h6">Progress</Typography>
				<Typography variant="body2">
					Progress indicator styling
				</Typography>
			</StyledPaper>

			<StyledPaper variant="section">
				<Typography variant="h6">Section</Typography>
				<Typography variant="body2">
					Section container styling
				</Typography>
			</StyledPaper>
		</Box>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of all three variants side by side.',
			},
		},
	},
};
