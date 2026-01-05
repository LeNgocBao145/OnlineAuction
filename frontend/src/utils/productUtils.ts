import type { ProductBid } from "@/types/Product";

export function getHighestBidder(bids: ProductBid[] = []) {
  if (!bids || bids.length === 0) return { id: undefined, name: "—", amount: undefined };
  const sorted = [...bids].sort((a, b) => b.amount - a.amount);
  return { id: sorted[0].bidder_id, name: sorted[0].bidder_name, amount: sorted[0].amount };
}

export function getImageUrl(url?: string | null) {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;

  // Get API URL and remove trailing /api if present to get the base server URL
  let baseUrl = import.meta.env.VITE_API_URL || '';
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 4);
  } else if (baseUrl.endsWith('/api/')) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 5);
  }

  // Ensure we don't end up with double slashes
  const separator = baseUrl.endsWith('/') ? '' : '/';
  return `${baseUrl}${separator}assets/products/${url}`;
}

