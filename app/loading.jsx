export default function Loading() {
	return (
		<main className="loading-shell" aria-label="Loading market dashboard">
			<section className="loading-header">
				<div>
					<div className="skeleton skeleton-eyebrow" />
					<div className="skeleton skeleton-title" />
				</div>
				<div className="skeleton skeleton-pill" />
			</section>

			<section className="loading-grid">
				<div className="skeleton skeleton-card primary" />
				<div className="skeleton skeleton-card" />
				<div className="skeleton skeleton-card" />
			</section>

			<section className="loading-grid panels">
				<div className="skeleton skeleton-panel" />
				<div className="skeleton skeleton-panel" />
			</section>
		</main>
	);
}
