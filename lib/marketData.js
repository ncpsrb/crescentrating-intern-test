import { scrapeMarketDataResult } from "./marketScraper.js";
import { writeResultFileIfChanged } from "./resultStore.js";

// UI entry point: scrape live source data directly; only write result when debugging.
export async function loadMarketData(year) {
	const scrapedResult = await scrapeMarketDataResult(year);

	if (process.env.DEBUG_RESULT === "true") {
		const writeResult = await writeResultFileIfChanged(scrapedResult);

		console.info(
			`[market-data] resultFile=${writeResult.path} changed=${writeResult.changed}`,
		);
	}

	return scrapedResult;
}
