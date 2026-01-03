import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useUserStore from "@/stores/userStore";
import useAuthStore from "@/stores/authStore";
import { formatDate } from "@/utils/dateUtils";

export default function BidsBody() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { biddings, loading, error, fetchBiddings } = useUserStore();
    const [statusFilter, setStatusFilter] = useState<number>(4);
    const [visibleCount, setVisibleCount] = useState<number>(5);
    const [page] = useState<number>(1);

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
        if (statusFilter === 3) return bid.state === "sold" && bid.highest_bidder_id === user?.id.toString(); // Won - sold and in won list
        if (statusFilter === 4) return bid.state === "sold" && bid.highest_bidder_id !== user?.id.toString(); // Losing - sold but not in won list
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
                {visibleBiddings.length > 0 ? visibleBiddings.map((bid) => (
                    <li key={bid.id} className="border border-white/10 rounded-lg bg-(--secondary) p-4 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate(`/product/${bid.id}`)}>
                        <div className="grid grid-cols-[1fr_2fr] gap-4">
                            <div>
                                <img src={bid.image} alt={bid.name} className="rounded-md border border-white/10 aspect-square h-full object-cover" />
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
                                            <p className="text-2xl text-(--primary)">${parseFloat(bid.bid_price)?.toFixed(2) || "0.00"}</p>
                                            <p className="text-white/60">Your Bid</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-2xl text-white">{bid.bid_date ? formatDate(bid.bid_date) : "N/A"}</p>
                                            <p className="text-white/60">Date</p>
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
                )) : <p className="text-white/60">No bids found</p>}
            </ul>
            {filteredBiddings.length > visibleCount && (
                <button className="bg-(--primary) text-black p-2 rounded-md mt-4 w-3/10 m-auto"
                    onClick={() => setVisibleCount(visibleCount + 5)}>
                    Load More</button>
            )}
        </div>
    );
}