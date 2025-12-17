import useProductStore from "@/stores/productStore";
import { formatDate } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/numberUtils";

export default function BidHistory() {
  const { product } = useProductStore();
  const bids = product?.bids || [];

  return (
    <div className="w-full p-4 bg-(--third) border border-white/10 rounded-xl">
      <h1 className="text-(--primary) text-2xl font-bold mb-4">Bids History</h1>
      {bids.length === 0 ? (
        <p className="text-white">No bids yet.</p>
      ) : (
        bids.map((bid, index) => (
          <div
            key={index}
            className="justify-between items-center bg-(--secondary) rounded-lg p-4 mb-2 grid grid-cols-[2fr_2fr_1fr]"
          >
            <div className="flex flex-col">
              <p className="text-white">{formatDate(bid.bid_time)}</p>
            </div>
            <p className="text-white">{bid.bidder_name}</p>
            <p className="text-(--primary) font-bold">
              {formatCurrency(bid.amount)} ₫
            </p>
          </div>
        ))
      )}
    </div>
  );
}
