import { useState, useEffect } from "react";
import useProductStore from "@/stores/productStore";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils";
import { IoCloseCircleOutline } from "react-icons/io5";

interface BidRequestsModalProps {
    productId: number;
    onClose: () => void;
}

export default function BidRequestsModal({
    productId,
    onClose,
}: BidRequestsModalProps) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { fetchBidRequests, acceptBidRequest, rejectBidRequest } = useProductStore();

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await fetchBidRequests(productId, { states: "pending" });
            setRequests(data?.data?.requests || []);
        } catch (error) {
            console.error("Error fetching bid requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, [productId]);

    const handleAccept = async (requestId: number) => {
        try {
            await acceptBidRequest(productId, requestId);
            toast.success("Bid request accepted!");
            await useProductStore.getState().fetchProduct(productId);
            loadRequests();
        } catch (error) {
            toast.error("Failed to accept bid request");
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            await rejectBidRequest(productId, requestId);
            toast.success("Bid request rejected!");
            await useProductStore.getState().fetchProduct(productId);
            loadRequests();
        } catch (error) {
            toast.error("Failed to reject bid request");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-1002 p-4">
            <div className="bg-(--third) border border-white/10 p-6 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                    <IoCloseCircleOutline size={30} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Bid Requests</h2>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-(--primary)"></div>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-10 text-white/60">
                        No pending bid requests for this product.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((req) => (
                            <div
                                key={req.request_id}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5"
                            >
                                <div>
                                    <p className="text-white font-semibold">{req.name}</p>
                                    <p className="text-white/40 text-sm">{req.email}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-white/40 text-xs">
                                            Requested{" "}
                                            {formatDate(req.request_date)}
                                        </p>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${req.rating >= 0.8
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            Rating: {(req.rating * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(req.request_id)}
                                        className="px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors border border-green-500/30"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleReject(req.request_id)}
                                        className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/30"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
