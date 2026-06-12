import { formatKpiValue } from "../lib/formatters";

export function KpiGrid({ kpis }) {
	return (
		<div className="kpi-grid" aria-live="polite">
			{kpis.map((kpi, index) => (
				<article
					className={`kpi-card ${index === 0 ? "primary" : ""}`}
					key={kpi.id}
				>
					<p className="kpi-label">{kpi.label}</p>
					<p className="kpi-value">{formatKpiValue(kpi)}</p>
					<div className="kpi-foot">
						<span className="growth-badge">{kpi.changeLabel}</span>
					</div>
				</article>
			))}
		</div>
	);
}
