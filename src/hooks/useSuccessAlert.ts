import { useState } from 'react';

/**
 * Custom hook for managing success alert state
 * Provides a consistent pattern for showing temporary success messages
 */
export function useSuccessAlert(duration: number = 2000) {
	const [success, setSuccess] = useState(false);

	const showSuccess = () => {
		setSuccess(true);
		setTimeout(() => setSuccess(false), duration);
	};

	return {
		success,
		showSuccess,
		setSuccess,
	};
}
