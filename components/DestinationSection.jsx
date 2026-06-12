export function DestinationSection({
  activeRegion,
  destinationLimit,
  destinations,
  emptyState,
  onRegionChange,
  onLimitChange,
  selectedYear,
  totalDestinations,
}) {
  const regions = getPublishedRegions(destinations);
  const filteredDestinations = filterDestinations(destinations, activeRegion);

  return (
    <section className="destinations-section" aria-labelledby="destinationHeading">
      <div className="destination-heading-row">
        <div className="section-heading">
          <p className="eyebrow">Destinations</p>
          <h2 id="destinationHeading">Muslim-friendly destinations</h2>
        </div>
        <TopLimitSelect
          destinationLimit={destinationLimit}
          onLimitChange={onLimitChange}
          totalDestinations={totalDestinations}
        />
      </div>

      <RegionFilters activeRegion={activeRegion} regions={regions} onRegionChange={onRegionChange} />

      <div className="destination-grid">
        {filteredDestinations.length ? (
          filteredDestinations.map((destination) => (
            <DestinationCard
              destination={destination}
              key={`${destination.rank}-${destination.country}`}
              selectedYear={selectedYear}
            />
          ))
        ) : (
          <p className="empty-state">{destinations.length ? "No destinations match this region filter." : emptyState}</p>
        )}
      </div>
    </section>
  );
}

export function TopLimitSelect({ destinationLimit, onLimitChange, totalDestinations }) {
  return (
    <label className="top-limit-filter">
      <span>Show</span>
      <select
        aria-label="Select destination rank limit"
        className="year-select"
        onChange={(event) => onLimitChange(event.target.value)}
        value={destinationLimit}
      >
        <option value="5">Top 5</option>
        <option value="10">Top 10</option>
        <option value="25">Top 25</option>
        <option value="50">Top 50</option>
        <option value="100">Top 100</option>
        <option value="all">All {totalDestinations}</option>
      </select>
    </label>
  );
}

export function RegionFilters({ activeRegion, regions, onRegionChange }) {
  if (!regions.length) {
    return null;
  }

  return (
    <div className="segmented-control" aria-label="Filter destinations by region">
      {["All", ...regions].map((region) => (
        <button
          aria-pressed={region === activeRegion}
          className={`segment-button ${region === activeRegion ? "active" : ""}`}
          key={region}
          onClick={() => onRegionChange(region)}
          type="button"
        >
          {region}
        </button>
      ))}
    </div>
  );
}

export function DestinationCard({ destination, selectedYear }) {
  return (
    <article className="destination-card">
      <div className="rank-row">
        <span className="rank">{destination.rank}</span>
        <span className="score">{destination.score}</span>
      </div>
      <p className="destination-name">{destination.country}</p>
      <p className="destination-region">Region: {destination.region}</p>
      <p className="destination-change">Rank change: {formatRankChange(destination.change)}</p>
      <p className="kpi-source">{formatDestinationSource(destination, selectedYear)}</p>
    </article>
  );
}

export function formatDestinationSource(destination, selectedYear) {
  if (destination.confidence === "primary csv") {
    return `GMTI ${selectedYear} CSV`;
  }

  return destination.confidence.toUpperCase();
}

export function formatRankChange(change) {
  if (change === "New") {
    return "New";
  }

  if (change === 0) {
    return "0";
  }

  if (change > 0) {
    return `+${change}`;
  }

  return String(change);
}

export function getPublishedRegions(destinations) {
  return [...new Set(destinations.map((destination) => destination.region))].filter((region) => region !== "-");
}

export function filterDestinations(destinations, activeRegion) {
  if (activeRegion === "All") {
    return destinations;
  }

  return destinations.filter((destination) => destination.region === activeRegion);
}
