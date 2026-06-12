import { UNAVAILABLE_NOTE } from "./sources.js";

// Extract only values that are visibly present in CrescentRating's page text.
export function parseCrescentRatingHomepage(html) {
	const plainText = toPlainText(html);
	const arrivalsMatch = plainText.match(
		/(\d{2,3})M\s*estimated international Muslim arrivals in 2025/i,
	);
	const projectedMatch = plainText.match(
		/(\d{2,3})M\s*projected arrivals by 2030/i,
	);
	const marketValueMatch = plainText.match(
		/\$?(\d{2,4})\s*billion Muslim travel market/i,
	);

	return {
		arrivals2025: toNumberOrNull(arrivalsMatch?.[1]),
		projectedArrivals2030: toNumberOrNull(projectedMatch?.[1]),
		marketValueUsdB: toNumberOrNull(marketValueMatch?.[1]),
	};
}

// The current fetched GMTI page exposes the 2025 rank table shell, not rows.
export function parseGmtiPage(html) {
	const plainText = toPlainText(html);
	const hasNo2025RankData = /No data available for 2025/i.test(plainText);

	return {
		destinations: [],
		regions: [],
		topRegion: null,
		rankStatus:
			hasNo2025RankData
				? "No 2025 rank rows exposed in fetched GMTI HTML."
				: UNAVAILABLE_NOTE,
	};
}

export function parseGmtiCsv(csvText) {
	const rows = parseCsvRows(csvText);
	const [headerRow, ...dataRows] = rows;
	const headerIndexes = buildCsvHeaderIndexes(headerRow || []);
	const destinations = dataRows
		.map((row) => parseGmtiCsvRow(row, headerIndexes))
		.filter(Boolean);

	return {
		destinations,
		regions: [],
		topRegion: null,
		rankStatus:
			destinations.length > 0
				? "Rankings parsed from official GMTI CSV."
				: UNAVAILABLE_NOTE,
	};
}

export function parseCldrTerritoryRegions(jsonText) {
	try {
		const data = JSON.parse(jsonText);
		const containment = data.supplemental.territoryContainment;

		return buildCountryRegionMap(containment);
	} catch {
		return {};
	}
}

// Used only for historical top ranks when the primary GMTI page has no rows.
export function parseGmtiReferencePage(html) {
	const plainText = toPlainText(html);
	const rankMatch = plainText.match(
		/GMTI 2023 rankings were published with ([A-Za-z]+) and ([A-Za-z]+) tied for first place\. In third position was ([A-Za-z ]+?), followed by the ([A-Za-z ]+?) in fourth place\. ([A-Za-züÜ]+) was in 5th place/i,
	);

	if (!rankMatch) {
		return {
			destinations: [],
			status: UNAVAILABLE_NOTE,
		};
	}

	return {
		destinations: buildHistoricalDestinationRanks(rankMatch),
		status: "2023 rankings parsed from public GMTI reference.",
	};
}

export function toPlainText(html) {
	return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

export function toNumberOrNull(value) {
	if (!value) {
		return null;
	}

	const number = Number(value);

	return Number.isFinite(number) ? number : null;
}

function buildHistoricalDestinationRanks(rankMatch) {
	const [
		,
		firstCountry,
		secondCountry,
		thirdCountry,
		fourthCountry,
		fifthCountry,
	] = rankMatch;
	const rankRows = [
		{ rank: "1=", country: firstCountry, metric: "GMTI 2023 rank 1 tie" },
		{ rank: "1=", country: secondCountry, metric: "GMTI 2023 rank 1 tie" },
		{ rank: 3, country: thirdCountry, metric: "GMTI 2023 rank 3" },
		{ rank: 4, country: fourthCountry, metric: "GMTI 2023 rank 4" },
		{ rank: 5, country: fifthCountry, metric: "GMTI 2023 rank 5" },
	];

	return rankRows.map((row) => ({
		rank: row.rank,
		country: row.country.trim(),
		score: row.metric,
		region: "-",
		tags: [],
		confidence: "secondary public",
	}));
}

function parseGmtiCsvRow(row, headerIndexes) {
	const rank = getCsvValue(row, headerIndexes, "rank");
	const countryCode = getCsvValue(row, headerIndexes, "countrycode");
	const country = getCsvValue(row, headerIndexes, "destination", "country");
	const score = getCsvValue(row, headerIndexes, "score");
	const change = getCsvValue(row, headerIndexes, "rankchange", "change");

	if (!rank || !countryCode || !country || !score) {
		return null;
	}

	return {
		rank: Number(rank),
		countryCode: countryCode.toLowerCase(),
		country,
		score: Number(score),
		change: parseRankChange(change),
		region: "-",
		tags: [],
		confidence: "primary csv",
	};
}

function buildCsvHeaderIndexes(headerRow) {
	return headerRow.reduce((indexes, header, index) => {
		const key = normalizeCsvHeader(header);

		return {
			...indexes,
			[key]: index,
		};
	}, {});
}

function getCsvValue(row, headerIndexes, ...keys) {
	const index = keys
		.map((key) => headerIndexes[key])
		.find((candidateIndex) => candidateIndex !== undefined);

	return index === undefined ? "" : row[index];
}

function normalizeCsvHeader(header) {
	return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseRankChange(value) {
	if (value === "New") {
		return "New";
	}

	return toNumberOrNull(value);
}

function parseCsvRows(csvText) {
	const rows = [];
	let row = [];
	let field = "";
	let insideQuotes = false;

	for (const character of csvText) {
		if (character === "\"") {
			insideQuotes = !insideQuotes;
			continue;
		}

		if (character === "," && !insideQuotes) {
			row.push(field.trim());
			field = "";
			continue;
		}

		if ((character === "\n" || character === "\r") && !insideQuotes) {
			if (field || row.length) {
				row.push(field.trim());
				rows.push(row);
				row = [];
				field = "";
			}
			continue;
		}

		field += character;
	}

	if (field || row.length) {
		row.push(field.trim());
		rows.push(row);
	}

	return rows;
}

function buildCountryRegionMap(containment) {
	const regionCodes = {
		"145": "Middle East",
		"030": "Asia-Pacific",
		"034": "Asia-Pacific",
		"035": "Asia-Pacific",
		"143": "Asia-Pacific",
		"009": "Asia-Pacific",
		"150": "Europe",
		"002": "Africa",
		"019": "Americas",
	};
	const countryRegionMap = {};

	Object.entries(regionCodes).forEach(([regionCode, regionName]) => {
		collectTerritories(regionCode, containment).forEach((countryCode) => {
			countryRegionMap[countryCode.toLowerCase()] = regionName;
		});
	});

	return countryRegionMap;
}

function collectTerritories(regionCode, containment) {
	const children = containment[regionCode]?._contains || [];

	return children.flatMap((childCode) => {
		if (/^[A-Z]{2}$/.test(childCode)) {
			return [childCode];
		}

		return collectTerritories(childCode, containment);
	});
}
