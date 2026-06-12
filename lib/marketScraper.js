import {
	parseCrescentRatingHomepage,
	parseCldrTerritoryRegions,
	parseGmtiCsv,
	parseGmtiPage,
	parseGmtiReferencePage,
} from "./marketParser.js";
import { fetchSourcePages } from "./sourceFetchers.js";
import {
	buildGmtiCsvSource,
	normalizeGmtiYear,
	SOURCES,
	UNAVAILABLE_NOTE,
} from "./sources.js";

// Single scrape pipeline: fetch pages, parse real values, normalize, then log diagnostics.
export async function scrapeMarketDataResult(year) {
	const selectedYear = normalizeGmtiYear(year);
	const retrievalDate = new Date().toISOString();
	const sourceResults = await fetchSourcePages({
		gmtiCsv: buildGmtiCsvSource(selectedYear),
	});
	const homepageData = parseCrescentRatingHomepage(
		sourceResults.crescentRatingHome.html,
	);
	const gmtiData = parseGmtiPage(sourceResults.gmti.html);
	const gmtiCsvData = parseGmtiCsv(sourceResults.gmtiCsv.html);
	const gmtiReferenceData = parseGmtiReferencePage(
		sourceResults.gmtiReference.html,
	);
	const countryRegionMap = parseCldrTerritoryRegions(
		sourceResults.cldrTerritories.html,
	);
	const normalizedData = buildNormalizedData(
		homepageData,
		gmtiData,
		gmtiCsvData,
		gmtiReferenceData,
		countryRegionMap,
		selectedYear,
	);

	const diagnostics = buildDataDiagnostics({
		normalizedData,
		sourceResults,
		gmtiData,
		gmtiCsvData,
		gmtiReferenceData,
	});
	const status = buildDashboardStatus(normalizedData, sourceResults);
	logServerDiagnostics({
		status,
		diagnostics,
		retrievalDate,
	});

	return {
		selectedYear,
		status,
		statusLabel: buildDashboardStatusLabel(status),
		retrievalDate,
		kpis: normalizedData.kpis,
		growth: normalizedData.growth,
		destinations: normalizedData.destinations,
		regions: normalizedData.regions,
		emptyStates: {
			destinations:
				gmtiCsvData.rankStatus || gmtiReferenceData.status || gmtiData.rankStatus,
			regions: UNAVAILABLE_NOTE,
		},
		sources: buildSources(sourceResults),
		diagnostics,
	};
}

function buildNormalizedData(
	homepageData,
	gmtiData,
	gmtiCsvData,
	gmtiReferenceData,
	countryRegionMap,
	selectedYear,
) {
	const rawDestinations = gmtiCsvData.destinations;
	const destinations = enrichDestinationRegions(rawDestinations, countryRegionMap);
	const regions = buildRegionalDistribution(destinations);
	const topRegion = regions[0]?.region ?? null;

	return {
		kpis: buildKpis(homepageData, topRegion, selectedYear),
		growth: buildGrowthData(homepageData),
		destinations,
		regions,
	};
}

function enrichDestinationRegions(destinations, countryRegionMap) {
	return destinations.map((destination) => ({
		...destination,
		region: countryRegionMap[destination.countryCode] || destination.region,
	}));
}

function buildRegionalDistribution(destinations) {
	const regionCounts = destinations.reduce((counts, destination) => {
		if (!destination.region || destination.region === "-") {
			return counts;
		}

		return {
			...counts,
			[destination.region]: (counts[destination.region] || 0) + 1,
		};
	}, {});
	const total = Object.values(regionCounts).reduce((sum, count) => sum + count, 0);

	if (!total) {
		return [];
	}

	return Object.entries(regionCounts)
		.map(([region, count]) => ({
			region,
			share: Math.round((count / total) * 100),
			confidence: "derived from CLDR country regions",
		}))
		.sort((left, right) => right.share - left.share);
}

function buildKpis(homepageData, topRegion, selectedYear) {
	const kpis = [];

	if (selectedYear === 2025 && homepageData.arrivals2025) {
		kpis.push({
			id: "arrivals",
			label: "Muslim Traveler Arrivals",
			value: homepageData.arrivals2025,
			unit: "million",
			displayType: "millions",
			changeLabel: "2025 estimate",
			note: "Fetched from CrescentRating homepage.",
			confidence: "primary",
		});
	}

	if (selectedYear === 2025 && homepageData.marketValueUsdB) {
		kpis.push({
			id: "marketValue",
			label: "Market Value",
			value: homepageData.marketValueUsdB,
			unit: "USD billion",
			displayType: "currencyBillions",
			changeLabel: "Public page value",
			note: "Fetched from CrescentRating homepage metadata.",
			confidence: "primary",
		});
	}

	if (topRegion) {
		kpis.push({
			id: "topRegion",
			label: "Top Region",
			value: topRegion,
			unit: "region",
			displayType: "text",
			changeLabel: "Derived from GMTI ranks",
			note: "Derived from GMTI country ranks and CLDR regions.",
			confidence: "derived public",
		});
	}

	return kpis;
}

function buildGrowthData(homepageData) {
	const points = [];

	if (homepageData.arrivals2025) {
		points.push({
			year: 2025,
			arrivals: homepageData.arrivals2025,
			status: "CrescentRating 2025 estimate",
			confidence: "primary",
		});
	}

	if (homepageData.projectedArrivals2030) {
		points.push({
			year: 2030,
			arrivals: homepageData.projectedArrivals2030,
			status: "CrescentRating 2030 projection",
			confidence: "primary",
		});
	}

	return points;
}

function buildDashboardStatus(normalizedData, sourceResults) {
	const requiredSourcesFetched =
		sourceResults.gmtiCsv.ok && sourceResults.cldrTerritories.ok;
	const allKpisAvailable = normalizedData.kpis.every(
		(kpi) => kpi.value !== null && kpi.value !== undefined && kpi.value !== "",
	);
	const hasTopFiveDestinations = normalizedData.destinations.length >= 5;
	const hasRegionalData = normalizedData.regions.length > 0;

	return requiredSourcesFetched &&
		allKpisAvailable &&
		hasTopFiveDestinations &&
		hasRegionalData
		? "available"
		: "unavailable";
}

function buildDashboardStatusLabel(status) {
	return status === "available"
		? "All required data fetched"
		: "Source data unavailable";
}

function buildSources(sourceResults) {
	return Object.keys(SOURCES).map((key) => {
		const result = sourceResults[key];

		return {
			label: result.source.label,
			url: result.source.url,
			role: result.source.role,
			status: result.ok ? "Fetched" : "Unavailable",
			error: result.error,
		};
	});
}

function buildDataDiagnostics({
	normalizedData,
	sourceResults,
	gmtiData,
	gmtiCsvData,
	gmtiReferenceData,
}) {
	return [
		...buildRequiredSourceDiagnostics(sourceResults),
		...buildKpiDiagnostics(normalizedData.kpis, sourceResults),
		...buildScoreDiagnostics(normalizedData.destinations, sourceResults),
		...buildDestinationDiagnostics(
			normalizedData.destinations,
			sourceResults,
			gmtiData,
			gmtiCsvData,
			gmtiReferenceData,
		),
		...buildRegionDiagnostics(normalizedData.regions, sourceResults),
	];
}

function buildRequiredSourceDiagnostics(sourceResults) {
	return ["gmtiCsv", "cldrTerritories"].map((key) => {
		const result = sourceResults[key];

		return {
			section: "Sources",
			field: result.source.label,
			status: result.ok ? "available" : "unavailable",
			reason: result.ok ? "Fetched successfully." : result.error,
			source: result.source.url,
		};
	});
}

function buildKpiDiagnostics(kpis, sourceResults) {
	return kpis.map((kpi) => ({
		section: "Hero KPI",
		field: kpi.label,
		status:
			kpi.value === null || kpi.value === undefined || kpi.value === ""
				? "unavailable"
				: "available",
		reason: kpi.note,
		source:
			kpi.id === "topRegion"
				? `${sourceResults.gmtiCsv.source.url} + ${sourceResults.cldrTerritories.source.url}`
				: SOURCES.crescentRatingHome.url,
	}));
}

function buildScoreDiagnostics(destinations, sourceResults) {
	return [
		{
			section: "Score Chart",
			field: "GMTI score rows",
			status: destinations.length > 0 ? "available" : "unavailable",
			reason:
				destinations.length > 0
					? `${destinations.length} destination score rows parsed from GMTI CSV.`
					: UNAVAILABLE_NOTE,
			source: sourceResults.gmtiCsv.source.url,
		},
	];
}

function buildDestinationDiagnostics(
	destinations,
	sourceResults,
	gmtiData,
	gmtiCsvData,
	gmtiReferenceData,
) {
	const destinationSource = sourceResults.gmtiCsv.source.url;

	return [
		{
			section: "Destinations",
			field: "Destination rows",
			status: destinations.length >= 5 ? "available" : "unavailable",
			reason:
				destinations.length >= 5
					? `${destinations.length} destination rows parsed from GMTI CSV.`
					: gmtiCsvData.rankStatus || gmtiReferenceData.status || gmtiData.rankStatus,
			source: destinationSource,
		},
		{
			section: "Destinations",
			field: "Destination regions",
			status:
				destinations.length > 0 &&
				destinations.every(
					(destination) => destination.region && destination.region !== "-",
				)
					? "available"
					: "unavailable",
			reason:
				"Region values are enriched from CLDR territory containment using GMTI country codes.",
			source: `${destinationSource} + ${SOURCES.cldrTerritories.url}`,
		},
		{
			section: "Destinations",
			field: "Rank change",
			status:
				destinations.length > 0 &&
				destinations.every(
					(destination) =>
						destination.change !== null && destination.change !== undefined,
				)
					? "available"
					: "unavailable",
			reason: "Rank change values are parsed from the GMTI CSV.",
			source: destinationSource,
		},
	];
}

function buildRegionDiagnostics(regions, sourceResults) {
	return [
		{
			section: "Distribution",
			field: "Regional demand share",
			status: regions.length > 0 ? "available" : "unavailable",
			reason:
				regions.length > 0
					? `${regions.length} region rows derived from GMTI country codes and CLDR regions.`
					: UNAVAILABLE_NOTE,
			source: `${sourceResults.gmtiCsv.source.url} + ${sourceResults.cldrTerritories.source.url}`,
		},
	];
}

function logServerDiagnostics({ status, diagnostics, retrievalDate }) {
	console.info(
		`[market-data] retrieval=${retrievalDate} dashboardStatus=${status}`,
	);

	diagnostics.forEach((item) => {
		const logLine = `[market-data] ${item.status.toUpperCase()} | ${item.section} | ${item.field} | ${item.reason} | ${item.source}`;

		if (item.status === "unavailable") {
			console.warn(logLine);
			return;
		}

		console.info(logLine);
	});
}
