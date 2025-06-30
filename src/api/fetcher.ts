export async function fetchJson<T>(
	url: string,
	options?: RequestInit & {
		headers?: Record<string, string>;
		timeoutMs?: number;
	}
): Promise<T> {
	const { timeoutMs = 5000, ...fetchOptions } = options || {};
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			...fetchOptions,
			headers: {
				...(options?.headers || {}),
			},
			signal: controller.signal,
		});
		clearTimeout(timeout);
		if (!res.ok) {
			const errorText = await res.text();
			throw new Error(`HTTP ${res.status}: ${errorText}`);
		}
		return res.json();
	} catch (err: unknown) {
		clearTimeout(timeout);
		if (
			err instanceof Error &&
			(err.name === 'AbortError' ||
				err.message === 'The operation was aborted.')
		) {
			throw new Error('Request timed out');
		}
		throw err;
	}
}
