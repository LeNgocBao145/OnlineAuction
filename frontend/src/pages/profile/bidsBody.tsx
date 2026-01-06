import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useUserStore from "@/stores/userStore";
import useAuthStore from "@/stores/authStore";
import { formatDate } from "@/utils/dateUtils";
import { getImageUrl } from "@/utils/productUtils";
import { formatCurrency } from "@/utils/numberUtils";
import { FaStar, FaRegStar, FaTrophy, FaMedal } from "react-icons/fa";
import { maskName } from "@/utils/maskUtils";

export default function BidsBody() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { biddings, loading, error, fetchBiddings, favorites, markFavorite, unmarkFavorite } = useUserStore();
    const [statusFilter, setStatusFilter] = useState<number>(4);
    const [visibleCount, setVisibleCount] = useState<number>(5);
    const [page] = useState<number>(1);
    const [loadingFavorite, setLoadingFavorite] = useState<string | number | null>(null);

    const isFavorited = (productId: string | number) => {
        return favorites?.products?.some(fav => fav.id == productId) || false;
    };

    const handleToggleFavorite = async (e: React.MouseEvent, productId: string | number) => {
        e.stopPropagation();
        if (!user?.id) return;
        try {
            setLoadingFavorite(productId);
            if (isFavorited(productId)) {
                await unmarkFavorite(user.id, productId);
            } else {
                await markFavorite(user.id, productId);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        } finally {
            setLoadingFavorite(null);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchBiddings(user.id, page, 10);
        }
    }, [user?.id]);

    if (error) {
        return (
            <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-10">
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-300">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-10 flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--primary)"></div>
            </div>
        );
    }

    const filteredBiddings = statusFilter === 6 ? (biddings || []) : (biddings || []).filter(bid => {
        if (statusFilter === 1) return bid.state === "bidding";
        if (statusFilter === 2) return bid.state === "sold";
        if (statusFilter === 3) return bid.state === "bidding" && bid.highest_bidder_id !== user?.id.toString(); // Losing - bidding and not highest bidder
        if (statusFilter === 4) return bid.state === "sold" && bid.highest_bidder_id === user?.id.toString(); // Won - sold and is highest bidder
        return true;
    });

    const visibleBiddings = filteredBiddings.slice(0, visibleCount);

    return (
        <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-10 justify-center flex flex-col">
            <h1 className="font-bold text-2xl text-(--primary)">My Bids</h1>
            <div className="flex items-center gap-4 mt-4 w-full">
                <p className="text-white/60">Sort by</p>
                <div className="grid lg:grid-cols-6 grid-cols-3 gap-2">
                    <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${statusFilter === 1 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(1)}>
                        Bidding</button>
                    <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${statusFilter === 2 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(2)}>
                        Sold</button>
                    <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${statusFilter === 3 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(3)}>
                        Losing</button>
                    <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${statusFilter === 4 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(4)}>
                        Won</button>
                    <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md mr-2 ${statusFilter === 5 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(5)}>
                        View All</button>
                </div>
            </div>
            <ul className="grid grid-cols-1 lg:grid-cols-2 mt-4 gap-4 w-full">
                {visibleBiddings.length > 0 ? visibleBiddings.map((bid) => {
                    // Check if user is highest bidder - compare as numbers, handle null/undefined
                    const userIdNum = user?.id ? Number(user.id) : null;
                    const highestBidderIdNum = bid.highest_bidder_id ? Number(bid.highest_bidder_id) : null;
                    const isHighestBidder = userIdNum !== null && highestBidderIdNum !== null && userIdNum === highestBidderIdNum;

                    const isWinning = bid.state === "bidding" && isHighestBidder;
                    const hasWon = bid.state === "sold" && isHighestBidder;

                    return (
                        <li
                            key={bid.id}
                            className={`rounded-lg bg-(--secondary) p-4 cursor-pointer hover:scale-[1.02] transition-transform relative
                            ${hasWon
                                    ? "border-2 border-(--primary) shadow-[0_0_15px_rgba(255,215,0,0.25)]"
                                    : isWinning
                                        ? "border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.25)]"
                                        : "border border-white/10"}`}
                            onClick={() => navigate(`/product/${bid.id}`)}
                        >
                            {/* Winning/Won Badge */}
                            {(isWinning || hasWon) && (
                                <div className={`absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-20 uppercase flex items-center gap-1
                                ${hasWon
                                        ? "bg-(--primary) text-black border border-yellow-400"
                                        : "bg-green-500 text-white border border-green-400 animate-pulse"}`}
                                >
                                    {hasWon ? <><FaTrophy className="w-3 h-3" /> Won</> : <><FaMedal className="w-3 h-3" /> Winning</>}
                                </div>
                            )}
                            <div className="grid grid-cols-[1fr_2fr] gap-4">
                                <div className="relative">
                                    <img src={getImageUrl(bid.image)} alt={bid.name} className="rounded-md border border-white/10 aspect-square h-full object-cover" />
                                    {/* Favorite Button */}
                                    <button
                                        onClick={(e) => handleToggleFavorite(e, bid.id)}
                                        disabled={loadingFavorite === bid.id}
                                        className={`absolute top-2 right-2 p-2 rounded-full transition-all z-10 
                                        ${isFavorited(bid.id)
                                                ? 'bg-black/60 text-(--primary)'
                                                : 'bg-black/40 text-white/60 hover:text-white hover:bg-black/60'}
                                        ${loadingFavorite === bid.id ? 'opacity-50' : ''}`}
                                        title={isFavorited(bid.id) ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        {isFavorited(bid.id) ? (
                                            <FaStar className="w-4 h-4 drop-shadow-[0_0_4px_rgba(255,215,0,0.5)]" />
                                        ) : (
                                            <FaRegStar className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <div className="flex flex-col">
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-white font-bold text-xl">{bid.name.length > 20 ? bid.name.substring(0, 20) + "..." : bid.name}</h2>
                                        </div>
                                    </div>
                                    <div className="flex flex-col mt-4">
                                        <div className="flex justify-between mb-4">
                                            <div className="flex flex-col">
                                                <p className="text-2xl text-(--primary)">{formatCurrency(parseFloat(bid.bid_price)) || "0.00"}</p>
                                                <p className="text-white/60">Your Bid</p>
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-2xl text-white">{bid.bid_date ? formatDate(bid.bid_date) : "N/A"}</p>
                                                <p className="text-white/60">Date</p>
                                            </div>
                                        </div>

                                        {/* Highest Bidder Info */}
                                        <div className="mb-4">
                                            <div className="flex flex-col">
                                                <p className={`text-xl font-bold truncate ${isHighestBidder ? "text-green-400" : "text-white"}`}>
                                                    {isHighestBidder ? "You" : (maskName(bid.highest_bidder || "") || "N/A")}
                                                </p>
                                                <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">
                                                    {bid.state === "sold" ? "Final Winner" : "Current Highest Bidder"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-3 h-3 rounded-full ${bid.state === "incoming"
                                                    ? "bg-yellow-400"
                                                    : bid.state === "bidding"
                                                        ? "bg-green-400"
                                                        : "bg-red-500"
                                                    }`}
                                                ></span>
                                                <p className="text-white/60">
                                                    {bid.state === "incoming"
                                                        ? "Incoming"
                                                        : bid.state === "bidding"
                                                            ? "Bidding"
                                                            : "Sold"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    )
                }) : <p className="text-white/60">No bids found</p>}
            </ul>
            {filteredBiddings.length > visibleCount && (
                <button className="bg-(--primary) text-black p-2 rounded-md mt-4 w-3/10 m-auto"
                    onClick={() => setVisibleCount(visibleCount + 5)}>
                    Load More</button>
            )}
        </div>
    );
}