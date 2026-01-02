import useProductStore from "@/stores/productStore";
import { formatDate } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/numberUtils";

export default function BidHistory() {
  const { product } = useProductStore();
  const bids = product?.bids || [];

  const isSeller = true; // Replace with actual logic to determine if the user is the seller

  const handleDenial = (bidId: number) => {
    // logic
    console.log(`Denying bid with ID: ${bidId}`);

    //
    throw new Error("Deny bid not implemented yet");
  }

  const maskName = (name: string) => {
    const parts = name.trim().split(" ");
    return parts.length === 1 ? parts[0] : `****${parts.at(-1)}`;
  };

  return (
    <div className="w-full p-4 bg-(--third) border border-white/10 rounded-xl">
      <h1 className="text-(--primary) text-2xl font-bold mb-4">Bids History</h1>
      {bids.length === 0 ? (
        <p className="text-white">No bids yet.</p>
      ) : (
        bids.map((bid, index) => (
          <div
            key={index}
            className="justify-between items-center bg-(--secondary) rounded-lg p-4 mb-2 grid grid-cols-[2fr_2fr_1fr] gap-4"
          >
            <div className="flex flex-col">
              <p className="text-white font-bold text-sm">{formatDate(bid.bid_time)}</p>
            </div>
            <p className="text-white text-md">{maskName(bid.bidder_name)}</p>
            <p className="text-(--primary) font-bold">
              {formatCurrency(bid.amount)}
            </p>
            {isSeller && (
              <div className="col-span-3 flex justify-end mt-2">
                <button onClick={() => handleDenial(index)} className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition-colors duration-200">
                  Deny
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
