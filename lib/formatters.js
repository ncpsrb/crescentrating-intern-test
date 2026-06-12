export function formatKpiValue(kpi) {
  if (kpi.value === null || kpi.value === undefined || kpi.value === "") {
    return "-";
  }

  if (kpi.displayType === "millions") {
    return `${kpi.value}M`;
  }

  if (kpi.displayType === "currencyBillions") {
    return `USD ${kpi.value}B`;
  }

  return kpi.value;
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatPercent(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${value}%`;
}
