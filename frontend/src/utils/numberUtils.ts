export function formatCurrency(value?: number | null, currencySymbol = "₫") {
  if (value === null || value === undefined) return "—";
  return `${value.toLocaleString("vi-VN")} ${currencySymbol}`;
}

