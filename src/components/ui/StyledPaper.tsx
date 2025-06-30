import { Paper } from '@mui/material';
import type { PaperProps } from '@mui/material';
import { forwardRef } from 'react';

interface StyledPaperProps extends Omit<PaperProps, 'variant'> {
	variant?: 'card' | 'section' | 'progress';
}

/**
 * Reusable styled Paper component with consistent design patterns
 */
export const StyledPaper = forwardRef<HTMLDivElement, StyledPaperProps>(
	({ variant = 'section', sx, ...props }, ref) => {
		const getVariantStyles = () => {
			switch (variant) {
				case 'card':
					return {
						borderRadius: 3,
						p: 0,
						overflow: 'hidden',
						width: '100%',
						maxWidth: { xs: '100%', sm: 480 },
						border: '1px solid',
						borderColor: 'divider',
						boxShadow: 'none',
					};
				case 'progress':
					return {
						borderRadius: 2,
						p: 2,
						display: 'flex',
						alignItems: 'center',
						minHeight: 48,
						width: '100%',
						maxWidth: { xs: '100%', sm: 480 },
						border: '1px solid',
						borderColor: 'divider',
						boxShadow: 'none',
					};
				case 'section':
				default:
					return {
						borderRadius: 2,
						p: 2,
						minHeight: 100,
						width: '100%',
						maxWidth: { xs: '100%', sm: 480 },
						border: '1px solid',
						borderColor: 'divider',
						boxShadow: 'none',
					};
			}
		};

		return (
			<Paper
				ref={ref}
				elevation={0}
				sx={{
					...getVariantStyles(),
					...sx,
				}}
				{...props}
			/>
		);
	}
);

StyledPaper.displayName = 'StyledPaper';
