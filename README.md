# Muslim Travel Market Intelligence Dashboard

Next.js dashboard for exploring GMTI destination rankings from live public sources. The app traces each value from fetch, parse, normalization, and render so missing source data is visible instead of silently replaced.

## Current Behavior

- Fetches GMTI ranking CSV by selected year.
- Enriches destination regions from Unicode CLDR territory containment.
- Shows year-aware KPI cards only when values are available.
- Lets users switch destination visibility between Top 5, Top 10, Top 25, Top 50, Top 100, and All without refetching.
- Updates the GMTI score chart, regional share chart, and Top Region from the selected Top N set.
- Shows a live data trace table for available and unavailable fields.
- Uses a skeleton loading screen while server data is fetched.
- Does not use fallback/sample values as real dashboard data.

## Tech Stack

- Next.js App Router
- React
- Native SVG charts
- Server-side source fetching and parsing

## Getting Started

Use a recent Node.js LTS release, then install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`. If that port is already in use, Next.js will choose another port such as `3001`.

## Scripts

- `npm run dev` - start the local development server
- `npm run build` - create a production build
- `npm run start` - run the production build locally

## URL Behavior

- `?year=2025` selects the GMTI year shown in the dashboard.
- Unsupported or missing year values fall back to the default supported year.

## Data Flow

1. `app/page.jsx` reads the selected year from `searchParams`.
2. `lib/marketData.js` calls the live scraping pipeline.
3. `lib/marketScraper.js` fetches, parses, and normalizes public-source data.
4. `components/Dashboard.jsx` derives the visible Top N rankings, charts, and KPI display state.
5. The UI renders unavailable states when source values cannot be verified.

## Project Structure

- `app/page.jsx` - server entry point that reads the selected year and loads dashboard data.
- `app/loading.jsx` - skeleton loading state.
- `app/globals.css` - global dashboard styling and responsive layout.
- `components/Dashboard.jsx` - client dashboard shell, year selection, Top N state, and derived UI data.
- `components/KpiGrid.jsx` - KPI cards.
- `components/ChartPanels.jsx` - GMTI score and regional distribution SVG charts.
- `components/DestinationSection.jsx` - destination cards, region filter, and Top N selector.
- `components/SourceSection.jsx` - live data trace table.
- `lib/sources.js` - public source registry and supported GMTI years.
- `lib/sourceFetchers.js` - fetches public source pages/files and returns source status.
- `lib/marketParser.js` - parses fetched HTML, JSON, and CSV into structured values.
- `lib/marketScraper.js` - single scrape pipeline that fetches, parses, normalizes, and logs diagnostics.
- `lib/marketData.js` - UI-facing loader that returns scraped data directly.
- `lib/resultStore.js` - optional debug writer for the `result` file.
- `lib/formatters.js` - display formatting helpers.

## Data Rules

The app must not invent or hardcode live dashboard data. If the selected GMTI CSV or supporting source cannot be fetched and parsed, the UI should show an unavailable state and the server should log the failed source.

Historical years are only shown when their public CSV is available. For example, if `2020.csv` returns `HTTP 404`, the dashboard must not substitute another year or a secondary reference as real 2020 data.

## Related Docs

- `PRD` - product requirements and acceptance criteria
- `RULES.md` - coding, styling, and delivery rules for implementation
- `QUESTIONS` - prompt/answer notes from the competency test

## Debug Result File

The UI does not depend on the root `result` file. Set `DEBUG_RESULT=true` to write the latest scraped result for debugging or audit. The writer avoids rewriting `result` when only run metadata, such as `retrievalDate`, changed.
