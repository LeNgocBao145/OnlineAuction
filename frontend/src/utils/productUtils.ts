import type { ProductBid } from "@/types/Product";

export function getHighestBidder(bids: ProductBid[] = []) {
  if (!bids || bids.length === 0) return { id: undefined, name: "—", amount: undefined };
  const sorted = [...bids].sort((a, b) => b.amount - a.amount);
  return { id: sorted[0].bidder_id, name: sorted[0].bidder_name, amount: sorted[0].amount };
}

