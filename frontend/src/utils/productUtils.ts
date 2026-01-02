import type { ProductBid } from "@/types/Product";

export function getHighestBidder(bids: ProductBid[] = []) {
  if (!bids || bids.length === 0) return { name: "—", amount: undefined };
  const sorted = [...bids].sort((a, b) => b.amount - a.amount);
  return { name: sorted[0].bidder_name, amount: sorted[0].amount };
}

