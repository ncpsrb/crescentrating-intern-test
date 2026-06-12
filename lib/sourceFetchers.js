import { SOURCES } from "./sources.js";

// Fetch all configured pages on the server, avoiding browser CORS issues.
export async function fetchSourcePages(sourceOverrides = {}) {
	const sourceEntries = Object.entries({
		...SOURCES,
		...sourceOverrides,
	});
	const settledResults = await Promise.all(
		sourceEntries.map(([key, source]) => fetchSourcePage(key, source)),
	);

	return Object.fromEntries(settledResults);
}

// A failed source fetch becomes traceable metadata instead of dashboard data.
export async function fetchSourcePage(key, source) {
	try {
		const response = await fetch(source.url, {
			cache: "no-store",
			headers: {
				...(source.referer ? { referer: source.referer } : {}),
				"user-agent": "MuslimTravelDashboard/1.0",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		return [
			key,
			{
				ok: true,
				html: await response.text(),
				error: "",
				source,
			},
		];
	} catch (error) {
		return [
			key,
			{
				ok: false,
				html: "",
				error: error.message,
				source,
			},
		];
	}
}
