import { Box, Stack } from '@mui/material';
import type { ReactNode } from 'react';

interface PageLayoutProps {
	title?: string;
	alignItems?: 'center' | 'flex-start';
	titleAlign?: 'center' | 'left';
	children: ReactNode;
}

export default function PageLayout({
	alignItems = 'center',
	children,
}: PageLayoutProps) {
	return (
		<Box
			sx={{
				width: '100%',
				flexGrow: 1,
				bgcolor: 'background.default',
				p: 3,
			}}
		>
			<Stack
				spacing={3}
				sx={{
					width: '100%',
					maxWidth: { xs: '100%', sm: 480 },
					mx: 'auto',
					alignItems,
					pb: 10,
				}}
			>
				{children}
			</Stack>
		</Box>
	);
}
