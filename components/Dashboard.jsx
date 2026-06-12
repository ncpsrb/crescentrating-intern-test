"use client";

import { useMemo, useState } from "react";
import { ChartPanels } from "./ChartPanels";
import { DestinationSection } from "./DestinationSection";
import { KpiGrid } from "./KpiGrid";
import { SourceSection } from "./SourceSection";
import { formatDate } from "../lib/formatters";

export default function Dashboard({ availableYears, marketData, selectedYear }) {
	const [activeRegion, setActiveRegion] = useState("All");
	const [destinationLimit, setDestinationLimit] = useState("10");
	const isAvailable = marketData.status === "available";
	const rankedDestinations = useMemo(
		() => limitDestinations(marketData.destinations, destinationLimit),
		[marketData.destinations, destinationLimit],
	);
	const rankedRegions = useMemo(
		() => buildRegionalDistribution(rankedDestinations),
		[rankedDestinations],
	);
	const kpis = useMemo(
		() => buildDisplayKpis(marketData.kpis, rankedRegions[0]?.region),
		[marketData.kpis, rankedRegions],
	);
	const chartData = useMemo(
		() => ({
			...marketData,
			destinations: rankedDestinations,
			regions: rankedRegions,
		}),
		[marketData, rankedDestinations, rankedRegions],
	);

	return (
		<>
			<header className="site-header">
				<div>
					<p className="eyebrow">Market intelligence</p>
					<h1>Muslim Travel Dashboard</h1>
				</div>
				<div className="header-actions">
					<YearFilter
						availableYears={availableYears}
						selectedYear={selectedYear}
					/>
					<div className={`source-pill ${isAvailable ? "" : "warning"}`}>
						{marketData.statusLabel} · {formatDate(marketData.retrievalDate)}
					</div>
				</div>
			</header>

			<main>
				<section className="hero-grid" aria-labelledby="heroHeading">
					<div className="section-heading hero-heading">
						<p className="eyebrow">Global opportunity</p>
						<h2 id="heroHeading">Muslim travel market at a glance</h2>
					</div>
					<KpiGrid kpis={kpis} />
				</section>

				<ChartPanels data={chartData} />

				<DestinationSection
					activeRegion={activeRegion}
					destinationLimit={destinationLimit}
					destinations={rankedDestinations}
					emptyState={marketData.emptyStates.destinations}
					onRegionChange={setActiveRegion}
					onLimitChange={setDestinationLimit}
					selectedYear={selectedYear}
					totalDestinations={marketData.destinations.length}
				/>

				<SourceSection
					diagnostics={marketData.diagnostics}
				/>
			</main>
		</>
	);
}

function limitDestinations(destinations, destinationLimit) {
	if (destinationLimit === "all") {
		return destinations;
	}

	const numericLimit = Number(destinationLimit);

	return destinations.filter((destination) => Number(destination.rank) <= numericLimit);
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
			confidence: "derived from GMTI CSV rows and CLDR regions",
		}))
		.sort((left, right) => right.share - left.share);
}

function buildDisplayKpis(kpis, topRegion) {
	const nonRegionKpis = kpis.filter((kpi) => kpi.id !== "topRegion");
	const topRegionKpi = kpis.find((kpi) => kpi.id === "topRegion");

	if (!topRegion || !topRegionKpi) {
		return nonRegionKpis;
	}

	return [
		...nonRegionKpis,
		{
			...topRegionKpi,
			value: topRegion,
		},
	];
}

function YearFilter({ availableYears, selectedYear }) {
	function handleYearChange(event) {
		const nextUrl = new URL(window.location.href);
		nextUrl.searchParams.set("year", event.target.value);
		window.location.href = nextUrl.toString();
	}

	return (
		<label className="year-filter">
			<span>GMTI year</span>
			<select
				aria-label="Select GMTI year"
				className="year-select"
				onChange={handleYearChange}
				value={selectedYear}
			>
				{availableYears.map((year) => (
					<option key={year} value={year}>
						{year}
					</option>
				))}
			</select>
		</label>
	);
}
