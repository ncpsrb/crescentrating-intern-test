# Muslim Travel Market Intelligence Dashboard

Small Next.js dashboard for tracing Muslim travel market data from public source fetches to rendered KPI cards and charts.

## Project Structure

- `lib/sources.js` - public source configuration.
- `lib/sourceFetchers.js` - fetches public source HTML and returns source status.
- `lib/marketParser.js` - parses real values from fetched source text.
- `lib/marketScraper.js` - single scrape pipeline that fetches, parses, normalizes, and logs diagnostics.
- `lib/resultStore.js` - optional debug writer for the `result` file.
- `lib/marketData.js` - UI-facing loader that returns scraped data directly.
- `lib/formatters.js` - display formatting helpers.
- `components/Dashboard.jsx` - interactive dashboard shell.
- `components/*.jsx` - focused dashboard sections.
- `app/page.jsx` - server entry point that loads market data.
- `app/globals.css` - dashboard styling.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Data Rule

The app does not use fallback/sample values. If a value cannot be fetched and parsed from a public source, the UI shows `-` or an unavailable message.

## Result File

The UI does not depend on the root `result` file. Set `DEBUG_RESULT=true` to write the latest scraped result for debugging or audit. The writer does not rewrite `result` when the actual scraped data is unchanged; run-only fields such as `retrievalDate` are ignored during the change check.
