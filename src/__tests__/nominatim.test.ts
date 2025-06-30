import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { searchZipAutocomplete } from '../api/nominatim';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

const server = setupServer(
	http.get(`${NOMINATIM_URL}/search`, () => {
		return HttpResponse.text('Rate limit exceeded', { status: 429 });
	})
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('Nominatim Adapter', () => {
	it('throws on HTTP 429 (rate limit)', async () => {
		await expect(searchZipAutocomplete('90210')).rejects.toThrow(
			'HTTP 429'
		);
	});
});
