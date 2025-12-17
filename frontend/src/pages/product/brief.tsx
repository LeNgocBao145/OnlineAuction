import { useMemo, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import PlaceBidModal from "./modal/placeBid";
import useProductStore from "@/stores/productStore";
import { formatCurrency } from "@/utils/numberUtils";
import { getRemainingTime } from "@/utils/timeUtils";
import { getHighestBidder } from "@/utils/productUtils";
import { formatDate } from "@/utils/dateUtils";

export default function ProductBrief() {
  const [placingBid, setPlacingBid] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const product = useProductStore((state) => state.product);

  const highestBid = useMemo(
    () => getHighestBidder(product?.bids || []),
    [product]
  );

  if (!product) return null;

  return (
    <>
      {placingBid && (
        <div className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-1000" />
      )}
      <div className="relative border border-white/10 bg-(--third) w-full h-[600px] rounded-xl p-6 z-1001">
        {placingBid && (
          <PlaceBidModal
            setPlacingBid={setPlacingBid}
            currentBid={product.current_price}
            stepPrice={product.step_price}
          />
        )}

        <div className="flex justify-between mb-4">
          <h1 className="text-white text-3xl font-bold">{product.name}</h1>
          <button onClick={() => setFavorited(!favorited)}>
            {favorited ? (
              <FaStar className="w-6 h-6 text-(--primary)" />
            ) : (
              <FaRegStar className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
        <div className="flex mb-4">
          <div className="bg-black/70 rounded-md mr-4 h-full w-30 flex items-center justify-center p-4">
            <p className="text-(--primary) font-bold">
              {getRemainingTime(product.expired_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                product.state === "incoming"
                  ? "bg-yellow-400"
                  : product.state === "bidding"
                  ? "bg-green-400"
                  : "bg-red-500"
              }`}
            ></span>
            <p className="text-white/60">
              {product.state === "incoming"
                ? "Incoming"
                : product.state === "bidding"
                ? "Bidding"
                : "Ended"}
            </p>
          </div>
        </div>
        <div className="flex justify-between mb-4">
          <div className="flex flex-col">
            <p className="text-2xl text-(--primary)">
              {formatCurrency(product.current_price)}
            </p>
            <p className="text-white/60">Current price</p>
          </div>
          <div className="flex flex-col text-right">
            <p className="text-[20px] text-white">
              {formatCurrency(product.instant_price)}
            </p>
            <p className="text-white/60">Buy now</p>
          </div>
        </div>
        <div className="flex justify-between mb-4">
          <div className="flex flex-col">
            <p className="text-[20px] text-white">{product.seller_name}</p>
            <p className="text-white/60">Seller</p>
          </div>
          <div className="flex flex-col text-right">
            <p className="text-[20px] text-white">{highestBid.name}</p>
            <p className="text-white/60">Highest bidder</p>
          </div>
        </div>
        <div className="flex justify-between mb-4">
          <div className="flex flex-col">
            <p className="text-[20px] text-white">
              {product.bids?.length || 0}
            </p>
            <p className="text-white/60">Bids</p>
          </div>
          <div className="flex flex-col text-right">
            <p className="text-[20px] text-white">
              {formatDate(product.expired_at)}
            </p>
            <p className="text-white/60">End time</p>
          </div>
        </div>
        <div>
          <button
            className="w-full h-20 bg-(--primary) text-black rounded-lg mb-4 font-bold"
            onClick={() => setPlacingBid(!placingBid)}
          >
            Place bid
          </button>
          <button className="w-full h-20 bg-white/10 text-white rounded-lg">
            Buy now
          </button>
        </div>
      </div>
    </>
  );
}