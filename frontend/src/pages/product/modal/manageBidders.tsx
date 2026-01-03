import { useState, useEffect } from "react";
import useProductStore from "@/stores/productStore";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/numberUtils";
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaUserSlash, FaRobot, FaUser } from "react-icons/fa";

interface Bidder {
    bidder_id: number;
    bidder_name: string;
    bidder_email: string;
    bidder_rating: number;
    highest_bid: number | null;
    last_bid_date: string;
    auto_bid_max: number | null;
    bid_type: "manual" | "auto";
    is_refused: boolean;
}

interface ManageBiddersModalProps {
    productId: number;
    onClose: () => void;
}

export default function ManageBiddersModal({
    productId,
    onClose,
}: ManageBiddersModalProps) {
    const [bidders, setBidders] = useState<Bidder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refusing, setRefusing] = useState<number | null>(null);
    const [unrefusing, setUnrefusing] = useState<number | null>(null);
    const { fetchBidders, refuseBidder, unrefuseBidder } = useProductStore();

    const loadBidders = async () => {
        try {
            setLoading(true);
            const data = await fetchBidders(productId, { limit: 50 });
            setBidders(data?.data?.bidders || []);
        } catch (error) {
            console.error("Error fetching bidders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBidders();
    }, [productId]);

    const handleRefuse = async (bidderId: number, bidderName: string) => {
        if (!confirm(`Are you sure you want to refuse "${bidderName}"? This will remove all their bids and prevent them from bidding again.`)) {
            return;
        }

        try {
            setRefusing(bidderId);
            await refuseBidder(productId, bidderId);
            toast.success(`${bidderName} has been refused successfully!`);
            await loadBidders();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to refuse bidder");
        } finally {
            setRefusing(null);
        }
    };

    const handleUnrefuse = async (bidderId: number, bidderName: string) => {
        if (!confirm(`Are you sure you want to allow "${bidderName}" to bid again?`)) {
            return;
        }

        try {
            setUnrefusing(bidderId);
            await unrefuseBidder(productId, bidderId);
            toast.success(`${bidderName} can now bid again!`);
            await loadBidders();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to unrefuse bidder");
        } finally {
            setUnrefusing(null);
        }
    };

    const activeBidders = bidders.filter((b) => !b.is_refused);
    const refusedBidders = bidders.filter((b) => b.is_refused);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[1002] p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="bg-(--third) border border-white/10 p-6 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl relative z-10 flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                    <IoCloseCircleOutline size={30} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <span className="w-2 h-8 bg-(--primary) rounded-full"></span>
                    Manage Bidders
                </h2>
                <p className="text-white/50 text-sm mb-6">
                    View all bidders and refuse any bidder to remove their bids
                </p>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-(--primary)"></div>
                    </div>
                ) : activeBidders.length === 0 && refusedBidders.length === 0 ? (
                    <div className="text-center py-10 text-white/60 border border-dashed border-white/10 rounded-lg">
                        No bidders found for this product.
                    </div>
                ) : (
                    <div className="overflow-y-auto flex-1 space-y-6 pr-2 custom-scrollbar">
                        {/* Active Bidders */}
                        {activeBidders.length > 0 && (
                            <div>
                                <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">
                                    Active Bidders ({activeBidders.length})
                                </h3>
                                <div className="space-y-3">
                                    {activeBidders.map((bidder) => (
                                        <div
                                            key={bidder.bidder_id}
                                            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/8 rounded-xl border border-white/5 transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-(--primary)/30 to-(--primary)/10 flex items-center justify-center">
                                                    {bidder.bid_type === "auto" ? (
                                                        <FaRobot className="text-(--primary) w-5 h-5" />
                                                    ) : (
                                                        <FaUser className="text-(--primary) w-5 h-5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-white font-semibold truncate">
                                                            {bidder.bidder_name}
                                                        </p>
                                                        {bidder.bid_type === "auto" && (
                                                            <span className="text-xs bg-(--primary)/20 text-(--primary) px-2 py-0.5 rounded-full font-medium">
                                                                Auto-bid
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-white/40 text-sm truncate">
                                                        {bidder.bidder_email}
                                                    </p>
                                                    <p className="text-white/30 text-xs mt-1">
                                                        Rating: {(bidder.bidder_rating * 100).toFixed(0)}% •
                                                        Last activity: {formatDate(bidder.last_bid_date)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 ml-4">
                                                <div className="text-right">
                                                    {bidder.highest_bid && (
                                                        <p className="text-(--primary) font-bold">
                                                            {formatCurrency(bidder.highest_bid)}
                                                        </p>
                                                    )}
                                                    {bidder.auto_bid_max && (
                                                        <p className="text-white/50 text-xs">
                                                            Max: {formatCurrency(bidder.auto_bid_max)}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        handleRefuse(bidder.bidder_id, bidder.bidder_name)
                                                    }
                                                    disabled={refusing === bidder.bidder_id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all border border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {refusing === bidder.bidder_id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                                                    ) : (
                                                        <FaUserSlash className="w-4 h-4" />
                                                    )}
                                                    <span className="text-sm font-medium">Refuse</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Refused Bidders */}
                        {refusedBidders.length > 0 && (
                            <div>
                                <h3 className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-3">
                                    Refused Bidders ({refusedBidders.length})
                                </h3>
                                <div className="space-y-2">
                                    {refusedBidders.map((bidder) => (
                                        <div
                                            key={bidder.bidder_id}
                                            className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/10 opacity-60"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                                                    <FaUserSlash className="text-red-400 w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-white/60 font-medium text-sm">
                                                        {bidder.bidder_name}
                                                    </p>
                                                    <p className="text-white/30 text-xs">
                                                        {bidder.bidder_email}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleUnrefuse(bidder.bidder_id, bidder.bidder_name)
                                                }
                                                disabled={unrefusing === bidder.bidder_id}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-all border border-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {unrefusing === bidder.bidder_id ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400"></div>
                                                ) : (
                                                    <FaUser className="w-3 h-3" />
                                                )}
                                                <span className="text-xs font-medium">Unrefuse</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
