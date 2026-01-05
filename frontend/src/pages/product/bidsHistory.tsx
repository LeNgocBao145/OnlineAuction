import useProductStore from "@/stores/productStore";
import useAuthStore from "@/stores/authStore";
import { formatCurrency } from "@/utils/numberUtils";
import { maskName } from "@/utils/maskUtils";


export default function BidHistory() {
  const { product } = useProductStore();
  const { user } = useAuthStore();
  const bids = product?.bids || [];

  const getBidderDisplay = (bid: { bidder_id: number; bidder_name: string }) => {
    // If this bid belongs to the current user, show "You"
    if (user?.id && bid.bidder_id === user.id) {
      return <span className="text-(--primary) font-bold">You</span>;
    }
    // If current user is the seller, show full name
    if (product?.user_relation === "seller") {
      return bid.bidder_name;
    }
    // Otherwise, mask the name
    return maskName(bid.bidder_name);
  };

  return (
    <div className="w-full p-6 bg-(--third) border border-white/10 rounded-xl shadow-xl">
      <h2 className="text-(--primary) text-2xl font-bold mb-6 flex items-center gap-2">
        Bids History
      </h2>

      {bids.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-lg">
          <p className="text-white/40">No bids have been placed yet.</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
          {/* Header */}
          <div className="grid grid-cols-[1.5fr_2fr_1.5fr] gap-4 px-4 py-2 border-b border-white/5 text-xs uppercase tracking-widest text-white/40 font-semibold">
            <span>Time</span>
            <span>Bidder</span>
            <span className="text-right">Amount</span>
          </div>

          {bids.map((bid, index) => (
            <div
              key={index}
              className="group relative bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all duration-200 border border-transparent hover:border-white/10"
            >
              <div className="grid grid-cols-[1.5fr_2fr_1.5fr] gap-4 items-center">
                <div className="flex flex-col">
                  <p className="text-white/40 text-[11px] font-medium leading-none mb-1">
                    {new Date(bid.bid_time).toLocaleDateString()}
                  </p>
                  <p className="text-white font-mono text-xs leading-none">
                    {new Date(bid.bid_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>

                <div className="truncate pr-2">
                  <p className="text-white/90 text-sm font-semibold truncate group-hover:text-(--primary) transition-colors">
                    {getBidderDisplay(bid)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-(--primary) font-bold text-base tracking-tight leading-none">
                    {formatCurrency(bid.amount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

  );
}

