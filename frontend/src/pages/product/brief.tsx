import { useMemo, useState, useEffect } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import PlaceBidModal from "./modal/placeBid";
import useProductStore from "@/stores/productStore";
import useUserStore from "@/stores/userStore";
import useAuthStore from "@/stores/authStore";
import { formatCurrency } from "@/utils/numberUtils";
import { getRemainingTime } from "@/utils/timeUtils";
import { getHighestBidder } from "@/utils/productUtils";
import { formatDate } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import BidRequestsModal from "./modal/bidRequests";
import ManageBiddersModal from "./modal/manageBidders";
import { toast } from "sonner";
import { maskName } from "@/utils/maskUtils";

export default function ProductBrief() {
  const navigate = useNavigate();
  const [placingBid, setPlacingBid] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [viewingRequests, setViewingRequests] = useState(false);
  const [viewingBidders, setViewingBidders] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const product = useProductStore((state) => state.product);
  const { user } = useAuthStore();
  const { placeBid } = useProductStore();
  const { favorites, markFavorite, unmarkFavorite } = useUserStore();
  useEffect(() => {
    if (product?.id && favorites?.products) {
      const isFavorited = favorites.products.some(fav => fav.id === product.id);
      setFavorited(isFavorited);
    }
  }, [product?.id, favorites?.products]);

  const highestBid = useMemo(
    () => getHighestBidder(product?.bids || []),
    [product]
  );

  const handleToggleFavorite = async () => {
    if (!user?.id || !product?.id) return;

    try {
      if (favorited) {
        await unmarkFavorite(user.id, product.id);
      } else {
        await markFavorite(user.id, product.id);
      }
      setFavorited(!favorited);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleRequestToBid = async () => {
    if (!product?.id) return;
    try {
      setRequesting(true);
      await useProductStore.getState().askToBid(product.id);
      toast.success("Bid request sent successfully!");

      // Refresh product data to get updated bid request state
      await useProductStore.getState().fetchProduct(product.id);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send bid request");
    } finally {
      setRequesting(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product?.id || !product?.instant_price) return;
    try {
      await placeBid(product.id, { bidAmount: product.instant_price });
      toast.success("Instant buy successful! You are the winner.");
      // Refresh product data to reflect the sold state
      await useProductStore.getState().fetchProduct(product.id);
    } catch (error: any) {
      console.error("Error on instant buy: ", error);
      toast.error(error?.response?.data?.message || "Failed to complete instant buy");
    }
  }

  if (!product) return null;

  return (
    <>
      {placingBid && (
        <div
          className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-1000"

          onClick={() => setPlacingBid(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PlaceBidModal
              setPlacingBid={setPlacingBid}
              productId={product.id}
              currentBid={product.current_price}
              stepPrice={product.step_price}
            />
          </div>
        </div>
      )}
      <div className="relative border border-white/10 bg-(--third) w-full min-h-[600px] rounded-2xl p-6 lg:p-8 z-10 flex flex-col justify-between shadow-2xl">


        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-white text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight max-w-[85%]">
              {product.name}
            </h1>
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full transition-colors group ${user ? 'hover:bg-white/5' : 'cursor-not-allowed opacity-50'}`}
              disabled={!user}
              title={user ? (favorited ? 'Remove from favorites' : 'Add to favorites') : 'Login to add to favorites'}
            >
              {favorited ? (
                <FaStar className="w-7 h-7 text-(--primary) drop-shadow-[0_0_8px_rgba(255,215,0,0.4)]" />
              ) : (
                <FaRegStar className={`w-7 h-7 ${user ? 'text-white/40 group-hover:text-white' : 'text-white/20'} transition-colors`} />
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 flex flex-col items-center justify-center min-w-[120px]">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-0.5">
                {product.state === "incoming" ? "Opening in" : "Time Left"}
              </p>
              <p className="text-(--primary) font-mono text-lg font-bold leading-none">
                {getRemainingTime(product.state === "incoming" ? product.starting_at || "" : product.expired_at)}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${product.state === "incoming"
                  ? "bg-yellow-400"
                  : product.state === "bidding"
                    ? "bg-green-400"
                    : "bg-red-500"
                  }`}
              ></span>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                {product.state}
              </p>
            </div>
          </div>
        </div>

        {/* Info Grid Section */}
        <div className="grid grid-cols-1 gap-6 my-4">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <div className="flex flex-col">
              <span className="text-white/50 text-xs uppercase tracking-widest mb-1">Current price</span>
              <p className="text-2xl lg:text-3xl font-bold text-(--primary) drop-shadow-sm">
                {formatCurrency(product.current_price)}
              </p>
            </div>
            {product.instant_price && (
              <div className="flex flex-col text-right">
                <span className="text-white/50 text-xs uppercase tracking-widest mb-1">Buy now</span>
                <p className="text-lg lg:text-xl font-semibold text-white">
                  {formatCurrency(product.instant_price)}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 lg:gap-8">
            <div className="flex flex-col">
              <span className="text-white/50 text-xs uppercase tracking-widest mb-1">Seller</span>
              <p className="text-base lg:text-lg font-medium text-white/90">
                {product.user_relation === "seller" ? (
                  <span className="text-(--primary) font-bold">You</span>
                ) : (
                  product.seller_name
                )}
              </p>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-white/50 text-xs uppercase tracking-widest mb-1">
                {product.state === "sold" ? "Winner" : "Highest bidder"}
              </span>
              <p className="text-base lg:text-lg font-medium text-white/90">
                {highestBid.name === "—" ? "None" :
                  (user?.id && highestBid.id === user.id) ?
                    <span className="text-(--primary) font-bold">You</span> :
                    (product.user_relation === "seller" ? highestBid.name : maskName(highestBid.name))
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:gap-8">
            <div className="flex flex-col">
              <span className="text-white/50 text-xs uppercase tracking-widest mb-1">Bids</span>
              <p className="text-lg font-bold text-white/90">
                {product.bids?.length || 0}
              </p>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-white/50 text-xs uppercase tracking-widest mb-1">End time</span>
              <p className="text-sm font-medium text-white/90">
                {formatDate(product.expired_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="space-y-4 pt-6">
          {!user ? (
            <button
              className="w-full h-14 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold transition-all border border-white/10"
              onClick={() => navigate("/auth")}
            >
              Login to place bid
            </button>
          ) : product.state === "sold" ? (
            <button
              className={`w-full h-14 rounded-xl font-bold transition-all border ${product.user_relation === "seller" || product.user_relation === "winner"
                ? "bg-(--primary) text-black hover:opacity-90 border-transparent shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                : "bg-white/10 text-white/40 border-white/5 cursor-not-allowed"
                }`}
              onClick={() => {
                if (product.user_relation === "seller") navigate(`/transactions/seller/${product.id}`);
                else if (product.user_relation === "winner") navigate(`/transactions/bidder/${product.id}`);
              }}
              disabled={product.user_relation !== "seller" && product.user_relation !== "winner"}
            >
              {product.user_relation === "seller" || product.user_relation === "winner"
                ? "Proceed to transaction"
                : "Auction ended"}
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              {product.user_relation === "seller" ? (
                <div className="flex flex-col gap-3">
                  <button
                    className="w-full h-14 bg-(--primary) hover:bg-(--primary)/90 text-black rounded-xl font-bold border border-(--primary) transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                    onClick={() => navigate(`/profile/sellings/edit/${product.id}`)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Update Auction
                  </button>
                  <button
                    className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/20 transition-all flex items-center justify-center gap-2"
                    onClick={() => setViewingRequests(true)}
                  >
                    Manage Bid Requests
                  </button>
                  <button
                    className="w-full h-14 bg-(--primary)/10 hover:bg-(--primary)/20 text-(--primary) rounded-xl font-bold border border-(--primary)/30 transition-all flex items-center justify-center gap-2"
                    onClick={() => setViewingBidders(true)}
                  >
                    Manage Bidders
                  </button>
                </div>
              ) : (
                <>
                  {(() => {
                    // Check if user already has bid history in this product (user_relation === "bidder" means they have bids)
                    const userHasBidHistory = product.user_relation === "bidder";

                    // User needs permission if: low rating AND no approved request AND no bid history
                    const needsPermission = (Number(user.rating_count || 0) === 0 || Number(user.rating || 0) < 0.8)
                      && product.user_bid_request_state !== "success"
                      && !userHasBidHistory;

                    return needsPermission ? (
                      <button
                        className={`w-full h-14 rounded-xl font-bold transition-all border ${product.user_bid_request_state === "pending"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 cursor-not-allowed"
                          : "bg-(--primary) text-black hover:opacity-90 border-transparent shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                          }`}
                        onClick={handleRequestToBid}
                        disabled={requesting || product.user_bid_request_state === "pending"}
                      >
                        {requesting ? "Sending Request..." : product.user_bid_request_state === "pending" ? "Bid Request Pending" : "Apply for Bidding"}
                      </button>
                    ) : (
                      <button
                        className="w-full h-14 bg-(--primary) text-black rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                        onClick={() => setPlacingBid(true)}
                      >
                        Place a Bid
                      </button>
                    );
                  })()}
                  {/* Show Buy it now for users who can bid (approved OR doesn't need permission OR has bid history) */}
                  {product.instant_price && (
                    product.user_bid_request_state === "success" ||
                    (Number(user.rating_count || 0) > 0 && Number(user.rating || 0) >= 0.8) ||
                    product.user_relation === "bidder"
                  ) && (
                      <button
                        className="w-full h-14 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/10 font-bold transition-all"
                        onClick={handleBuyNow}
                      >
                        Buy it now
                      </button>
                    )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {viewingRequests && (
        <BidRequestsModal
          productId={product.id}
          onClose={() => setViewingRequests(false)}
        />
      )}

      {viewingBidders && (
        <ManageBiddersModal
          productId={product.id}
          onClose={() => setViewingBidders(false)}
        />
      )}
    </>
  );
}
