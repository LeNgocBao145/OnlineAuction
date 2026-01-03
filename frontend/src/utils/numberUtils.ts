export function formatCurrency(value?: number | null, currencySymbol = "$") {
  if (value === null || value === undefined) return "—";
  return `${currencySymbol}${value.toLocaleString("de-DE")}`;
}

