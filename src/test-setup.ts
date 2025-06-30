import '@testing-library/jest-dom';

// Suppress expected React Testing Library warnings in test environment
// These warnings are known issues with React 19 + Material-UI interactions
// that don't indicate actual problems in our tests
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
	const message = typeof args[0] === 'string' ? args[0] : '';

	// Suppress specific act() warnings that are expected with Material-UI components
	const actWarnings = [
		'The current testing environment is not configured to support act(...)',
		'An update to',
		'inside a test was not wrapped in act(...)',
		'Warning: An update to'
	];

	const shouldSuppress = actWarnings.some(warning => message.includes(warning));

	if (shouldSuppress) {
		return;
	}

	// Let all other errors through (including real test failures)
	originalConsoleError.apply(console, args);
};