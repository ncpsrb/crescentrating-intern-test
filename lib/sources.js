// Public source registry. Keep source URLs here so fetch and footer output use the same truth.
export const SOURCES = {
	crescentRatingHome: {
		label: "CrescentRating homepage",
		url: "https://crescentrating.com",
		role: "Primary source for arrivals and market value",
	},
	gmti: {
		label: "Mastercard-CrescentRating GMTI",
		url: "https://crescentrating.com/insights/gmti",
		role: "Primary GMTI landing page",
	},
	gmtiCsv: {
		label: "GMTI ranking CSV",
		url: "https://crescentrating.com/csv/gmti-2024/2025.csv",
		role: "Primary source for GMTI country ranks and scores",
		referer: "https://crescentrating.com/insights/gmti",
	},
	gmtiReference: {
		label: "Global Muslim Travel Index public reference",
		url: "https://en.wikipedia.org/wiki/Global_Muslim_Travel_Index",
		role: "Secondary public reference for historical top destination ranks",
	},
	cldrTerritories: {
		label: "Unicode CLDR territory containment",
		url: "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-core/supplemental/territoryContainment.json",
		role: "Supplemental source for mapping country codes to regions",
	},
};

export const UNAVAILABLE_NOTE = "Not available";
export const AVAILABLE_GMTI_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019];
export const DEFAULT_GMTI_YEAR = 2025;

export function buildGmtiCsvSource(year) {
	return {
		...SOURCES.gmtiCsv,
		label: `GMTI ${year} ranking CSV`,
		url: `https://crescentrating.com/csv/gmti-2024/${year}.csv`,
		role: `Primary source for GMTI ${year} country ranks and scores`,
		year,
	};
}

export function normalizeGmtiYear(year) {
	const numericYear = Number(year);

	return AVAILABLE_GMTI_YEARS.includes(numericYear)
		? numericYear
		: DEFAULT_GMTI_YEAR;
}
