import { formatPercent } from "../lib/formatters";

export function ChartPanels({ data }) {
	return (
		<section className="dashboard-grid" aria-label="Market charts">
			<article className="panel chart-panel">
				<PanelHeader
					eyebrow="GMTI score"
					title="Destination score by rank"
					note={buildScoreSummary(data.destinations)}
				/>
				<ScoreChart destinations={data.destinations} />
			</article>

			<article className="panel chart-panel">
				<PanelHeader
					eyebrow="Distribution"
					title="Regional demand share"
					note={buildRegionSummary(data.regions)}
				/>
				<RegionChart
					regions={data.regions}
					emptyState={data.emptyStates.regions}
				/>
			</article>
		</section>
	);
}

export function PanelHeader({ eyebrow, title, note }) {
	return (
		<div className="panel-header">
			<div>
				<p className="eyebrow">{eyebrow}</p>
				<h2>{title}</h2>
			</div>
			<p className="panel-note">{note}</p>
		</div>
	);
}

export function ScoreChart({ destinations }) {
	if (!destinations.length) {
		return (
			<p className="empty-state">
				Score data is unavailable from the fetched GMTI CSV.
			</p>
		);
	}

	const chart = getScoreChartGeometry(destinations);

	return (
		<div className="chart-shell">
			<svg
				className="chart-svg"
				viewBox="0 0 720 330"
				role="img"
				aria-label="GMTI destination score by rank"
			>
				{chart.grid.map((gridLine) => (
					<g key={gridLine.value}>
						<line
							className="grid-line"
							x1="58"
							x2="692"
							y1={gridLine.y}
							y2={gridLine.y}
						/>
						<text className="axis-label" x="10" y={gridLine.y + 4}>
							{gridLine.value}
						</text>
					</g>
				))}
				<path className="line-path" d={chart.path} />
				{chart.points.map((point) => (
					<g key={`${point.rank}-${point.country}`}>
						<circle className="chart-point" cx={point.x} cy={point.y} r="7">
							<title>{`${point.country}: rank ${point.rank}, score ${point.score}`}</title>
						</circle>
						{point.showLabel ? (
							<text
								className="axis-label"
								x={point.x}
								y="312"
								textAnchor="middle"
							>
								{point.rank}
							</text>
						) : null}
					</g>
				))}
			</svg>
		</div>
	);
}

export function RegionChart({ regions, emptyState }) {
	if (!regions.length) {
		return <p className="empty-state">{emptyState}</p>;
	}

	const maxShare = Math.max(...regions.map((region) => region.share));
	const barX = 150;
	const barMaxWidth = 360;
	const percentGap = 14;

	return (
		<div className="chart-shell region-chart-shell">
			<svg
				className="chart-svg"
				viewBox="0 0 620 330"
				role="img"
				aria-label="Regional demand share"
			>
				{regions.map((region, index) => {
					const y = 18 + index * 52;
					const width = scaleLinear(region.share, 0, maxShare, 0, barMaxWidth);

					return (
						<g key={region.region}>
							<text className="axis-label" x="0" y={y + 24}>
								{region.region}
							</text>
							<rect
								className="bar-hit"
								x={barX}
								y={y}
								width={width}
								height="28"
								rx="6"
							>
								<title>{`${region.region}: ${formatPercent(region.share)} · ${region.confidence}`}</title>
							</rect>
							<text className="axis-label percent-label" x={barX + width + percentGap} y={y + 24}>
								{formatPercent(region.share)}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}

export function buildScoreSummary(destinations) {
	const topDestination = destinations[0];
	const lowestVisible = destinations[destinations.length - 1];

	if (!topDestination || !lowestVisible) {
		return "Score data is unavailable from the fetched GMTI CSV.";
	}

	return `${destinations.length} CSV rows visible, from ${topDestination.score} to ${lowestVisible.score} score.`;
}

export function buildRegionSummary(regions) {
	const topRegion = regions[0];

	if (!topRegion) {
		return "Regional opportunity data is unavailable from fetched sources.";
	}

	return `${topRegion.region} leads at ${topRegion.share}% of demand.`;
}

export function getScoreChartGeometry(destinations) {
	const width = 720;
	const height = 330;
	const padding = { top: 24, right: 28, bottom: 44, left: 58 };
	const values = destinations.map((destination) => destination.score);
	const maxValue = Math.max(...values);
	const minValue = Math.min(...values);
	const labelInterval = Math.max(1, Math.ceil(destinations.length / 8));
	const plottedPoints = destinations.map((destination, index) => ({
		...destination,
		showLabel: index % labelInterval === 0 || index === destinations.length - 1,
		x: scaleLinear(
			index,
			0,
			Math.max(destinations.length - 1, 1),
			padding.left,
			width - padding.right,
		),
		y: scaleLinear(
			destination.score,
			Math.max(0, minValue - 5),
			maxValue,
			height - padding.bottom,
			padding.top,
		),
	}));

	return {
		points: plottedPoints,
		path: plottedPoints
			.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
			.join(" "),
		grid: [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
			y: padding.top + (height - padding.top - padding.bottom) * ratio,
			value: Math.round(
				maxValue - (maxValue - Math.max(0, minValue - 5)) * ratio,
			),
		})),
	};
}

export function scaleLinear(value, domainMin, domainMax, rangeMin, rangeMax) {
	if (domainMax === domainMin) {
		return rangeMin;
	}

	return (
		rangeMin +
		((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin)
	);
}
