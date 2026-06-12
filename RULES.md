# Coding and Styling Rules

## Project Context

Build a lightweight Muslim Travel Market Intelligence Dashboard for non-technical stakeholders. The dashboard should make the most important available metric understandable within 3 seconds, then support quick exploration of GMTI scores, destinations, and regional opportunities for the selected year.

---

## Coding Rules

### 1. Code Quality

- Keep the app simple, readable, and maintainable.
- Use clear, descriptive names for components, variables, files, and functions.
- Avoid unnecessary abstractions unless they reduce real duplication.
- Split repeated UI into reusable components.
- Keep data, utility functions, and UI components separated where possible.
- Do not use nested functions.
- Remove unused code, unused imports, commented-out experiments, and dead mock values before delivery.

### 2. Data Rules

- Use only publicly available sources.
- Prefer CrescentRating and GMTI sources when available.
- Do not invent data points.
- Do not hardcode live dashboard data directly in HTML, chart code, or UI components.
- Data should be real from available primary sources.
- Implement a dedicated data-fetching or data-ingestion function, such as `fetchMarketData()` or `loadMarketData()`, that retrieves data from primary/public source URLs before rendering the dashboard.
- Keep fetching, parsing, normalization, and UI rendering separated. The UI should consume normalized data returned by the data layer, not source-specific scraping logic.
- If a primary source does not provide a public API, the script may fetch a public HTML, JSON, CSV, or locally provided public report file and parse the required values from it.
- If live fetching fails because of CORS, network limits, source structure changes, or unavailable public data, show a visible empty state or "data unavailable" state instead of silently using unverified values.
- Local constants may only be used for source configuration, parsing selectors, labels, UI copy, supported years, or control options.
- Do not use fallback or sample data as real dashboard data.
- If a number is estimated, label it clearly as an estimate.
- Keep source URLs, retrieval date, and confidence/status metadata close to the data they support, either in the returned data object, data file, or dashboard footer.
- If the selected GMTI CSV is unavailable, keep that year unavailable and log the failed source. Do not substitute another year or secondary reference as real data.

### 3. Component Rules

- Build the dashboard from clear sections:
  - Hero KPI section
  - GMTI score chart
  - Muslim-friendly destinations with Top N selector
  - Regional market distribution
  - Live data trace table
- KPI cards should accept props or structured data rather than hardcoded repeated markup.
- Destination cards should be generated from fetched GMTI CSV destination objects.
- Chart data should live in a dedicated data structure, not inside chart JSX or template markup.

### 4. State and Interaction

- Keep interactions focused and useful.
- Tooltips should show the exact year/value or category/value being inspected.
- Filters, tabs, or toggles should visibly update the chart or destination section.
- The Top N selector should update destination cards, GMTI score chart, regional share chart, and Top Region without refetching.
- Avoid interactions that look clickable but do nothing.
- Provide an empty or unavailable state if data is missing.

### 5. Accessibility

- Use semantic HTML where possible.
- Maintain strong color contrast for text, badges, charts, and buttons.
- Buttons and interactive elements must have accessible names.
- Keyboard users should be able to tab through meaningful interactive elements.
- Do not communicate important information with color alone.
- Chart insights should also be summarized in nearby text.

### 6. Performance

- Keep dependencies minimal.
- Avoid large images or heavy assets unless they add clear value.
- Optimize visual assets before deployment.
- The dashboard should load quickly on a normal laptop and mobile browser.

### 7. Testing and Review

- Test the dashboard on desktop and mobile widths.
- Check that the most important KPI is visible above the fold.
- Check that charts render correctly and tooltips work.
- Check for console errors.
- Run available linting, formatting, or build commands before delivery.
- Verify that the final deliverable opens and runs from the shared URL or working file.

### 8. Documentation

- Keep `README.md`, `PRD`, and `RULES.md` aligned when product behavior changes.
- Update setup steps, supported controls, or source assumptions whenever implementation changes them.
- Do not document fallback/sample behaviors that the product no longer supports.
- Prefer concrete behavior descriptions over aspirational wording.

---

## Styling Rules

### 1. Visual Direction

- The dashboard should feel professional, credible, and presentation-ready.
- Prioritize clarity over decoration.
- Use a calm business intelligence style with enough visual warmth to fit the Muslim travel domain.
- Avoid a generic template look by using intentional typography, spacing, hierarchy, and data presentation.

### 2. Visual Hierarchy

- The most important available KPI is the primary visual focus.
- The largest available value should be readable within 3 seconds.
- Supporting KPIs should be clearly secondary.
- Section headings should help scanning without overpowering the data.
- Put the most important insight above the fold on both desktop and mobile.

### 3. Layout

- Use a responsive dashboard layout.
- Desktop should use a strong grid with clear alignment.
- Mobile should stack sections in priority order.
- Avoid cramped cards, tiny text, and overloaded rows.
- Keep consistent spacing between sections and cards.
- Do not nest cards inside other cards.

### 4. Typography

- Use a clean, modern sans-serif typeface.
- Use large, bold typography for headline KPIs.
- Use smaller, tighter typography for labels and metadata.
- Do not use oversized marketing-style headings inside dashboard panels.
- Keep letter spacing normal.

### 5. Color

- Use color to support meaning, not decoration.
- Suggested palette direction:
  - Deep green or teal for trust, halal travel, and market confidence
  - Warm gold or amber for highlights and ranking emphasis
  - Neutral grays for structure and readable dashboard surfaces
  - Red or orange only for negative changes or warnings
- Avoid a one-color interface.
- Avoid overly decorative gradients, glowing blobs, or busy backgrounds.

### 6. KPI Cards

- The primary KPI card should be visually larger than the others.
- Status badges should be easy to read and clearly indicate available, unavailable, positive, or negative states.
- Use concise labels such as "Top Region", "Muslim Traveler Arrivals", and "Market Value".
- Hide year-specific KPI cards when a matching public source value is unavailable for the selected year.
- Avoid long explanations inside KPI cards.

### 7. Charts

- Charts should be easy to read at a glance.
- Use clear axis labels, readable values, and helpful tooltips.
- Do not overcrowd charts with too many labels.
- Use consistent chart colors across the dashboard.
- Percent labels and axis labels must not be clipped at desktop or mobile widths.

### 8. Destination Cards

- Each destination card should show:
  - Rank
  - Country name
  - GMTI score or relevant metric
  - Region
  - Rank change
  - Source year label, such as `GMTI 2025 CSV`
- Ranking should be easy to scan for the selected Top N range.

### 9. Buttons and Controls

- Buttons should be reserved for clear actions.
- Controls should look consistent and have visible hover/focus states.
- Use tabs, segmented controls, or filters only if they improve exploration.
- Avoid decorative controls that do not affect the data.

### 10. Delivery Standard

- The final dashboard should look intentional, not like a default AI-generated mockup.
- The interface should support a quick stakeholder presentation without extra explanation.
- Any source notes should be visible but not visually dominant.
- The final answer paragraph should stay under 150 words and mention:
  - Tool used
  - One intentional design or product decision
  - One thing to improve with more time
