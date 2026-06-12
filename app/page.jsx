import Dashboard from "../components/Dashboard";
import { loadMarketData } from "../lib/marketData";
import { AVAILABLE_GMTI_YEARS, normalizeGmtiYear } from "../lib/sources";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const selectedYear = normalizeGmtiYear(resolvedSearchParams?.year);
  const marketData = await loadMarketData(selectedYear);

  return (
    <Dashboard
      availableYears={AVAILABLE_GMTI_YEARS}
      marketData={marketData}
      selectedYear={selectedYear}
    />
  );
}
