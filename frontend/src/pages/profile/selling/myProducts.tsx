import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router";
import useUserStore from "@/stores/userStore";
import useAuthStore from "@/stores/authStore";

export default function MyProducts() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { sellings, loading, error, fetchSellings } = useUserStore();
    const [statusFilter, setStatusFilter] = useState<number>(5);
    const [visibleProductsCount] = useState<number>(6);
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        if (user?.id) {
            fetchSellings(user.id, 1, 50);
        }
    }, [user?.id]);

    const productData = sellings || [];

    const filteredProducts = statusFilter === 5 ? productData : productData.filter(product => {
        if (statusFilter === 1) return product.state === "incoming";
        if (statusFilter === 2) return product.state === "bidding";
        if (statusFilter === 3) return product.state === "sold";
        return true;
    });

    const totalPages = Math.ceil(filteredProducts.length / visibleProductsCount) || 1;
    const visibleProducts = filteredProducts.slice((page - 1) * visibleProductsCount, page * visibleProductsCount);

    // Format time left from seconds
    const formatTime = (seconds: number) => {
        if (!seconds || seconds <= 0) return "Ended";
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    if (loading) {
        return (
            <div className="w-8/10 m-auto mt-6 flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--primary)"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-8/10 m-auto mt-6">
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-300">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-8/10 m-auto mt-6 justify-center flex flex-col">
            <h1 className="text-(--primary) text-2xl font-bold">Your Auctions and Products</h1>
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 p-4 w-full">
                <div className="flex items-center gap-4">
                    <p className="text-white/60">Filter by</p>
                    <div className="grid lg:grid-cols-4 grid-cols-2 gap-2">
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md ${statusFilter === 1 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => { setStatusFilter(1); setPage(1); }}>
                        Incoming</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md ${statusFilter === 2 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => { setStatusFilter(2); setPage(1); }}>
                        Bidding</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md ${statusFilter === 3 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => { setStatusFilter(3); setPage(1); }}>
                        Sold</button>
                        <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md ${statusFilter === 5 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => { setStatusFilter(5); setPage(1); }}>
                        View All</button>
                    </div>
                </div>
                <button className="bg-(--primary) text-black p-2 rounded-md flex justify-between items-center h-full m-auto lg:m-0"
                onClick={() => navigate('/createProduct')}>
                    <FaPlus className="inline mr-2" />
                    Create New Auction
                </button>
            </div>
            <div className="border border-white/10 rounded-lg p-6 bg-(--third) mt-6 w-full flex justify-center flex-col">
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {visibleProducts.length > 0 ? (visibleProducts.map((product) => (
                        <li key={product.id} className="border border-white/10 rounded-lg bg-(--secondary) p-4 grid grid-cols-1 lg:grid-cols-[2fr_4fr_2fr] justify-center gap-4 hover:scale-101 hover:cursor-pointer transition-transform"
                            onClick={() => navigate(`/product/${product.id}`)}
                        >
                            <div>
                                <img src={product.image || "/placeholder.jpg"} alt={product.name} className="h-full aspect-square rounded-md mr-4 border border-white/10 object-cover" />
                            </div>
                            <div className="flex flex-col justify-between">
                                <div>
                                    <h2 className="font-bold text-white text-2xl">{product.name?.length > 20 ? product.name.substring(0, 20) + "..." : product.name}</h2>
                                </div>
                                <div>
                                    <p className="text-white">{product.bid_count || 0} {Number(product.bid_count || 0) <= 1 ? "Bid" : "Bids"}</p>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex flex-col">
                                        <p className="text-white">${Number(product.current_price)?.toFixed(2) || "0.00"}</p>
                                        <p className="text-white/60">Current Price</p>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <p className="text-(--primary)">{product.highest_bidder || "N/A"}</p>
                                        <p className="text-white/60">{product.state === "sold" ? "Winner" : "Highest Bidder"}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex flex-col">
                                        <p className="text-white">{formatTime(Number(product.time_left))}</p>
                                        <p className="text-white/60">{product.state === "incoming" ? "Open In" : product.state === "bidding" ? "Time Left" : "Ended"}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${
                                            product.state === "incoming"
                                                ? "bg-yellow-400"
                                                : product.state === "bidding"
                                                ? "bg-green-400"
                                                : "bg-purple-500"
                                            }`}
                                        ></span>
                                        <p className="text-white/60">
                                            {product.state === "incoming"
                                            ? "Incoming"
                                            : product.state === "bidding"
                                            ? "Active"
                                            : "Sold"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center">
                                {product.state !== "sold" && <button className="bg-blue-400 text-black p-2 rounded-md mt-4 w-9/10 hover:cursor-pointer"
                                onClick={(e) => {e.stopPropagation(); navigate(`/product/${product.id}/edit`)}}>
                                Edit Auction</button>}
                                {product.state === "bidding" && <button className="bg-red-400 text-black p-2 rounded-md mt-4 w-9/10 hover:cursor-pointer"
                                onClick={(e) => {e.stopPropagation();}}>
                                Close Auction</button>}
                                <button className={`bg-white/10 text-white p-2 rounded-md mt-4 w-9/10 ${product.state !== 'bidding' ? '' : 'opacity-10 cursor-not-allowed'}`}
                                onClick={(e) => { e.stopPropagation();}}>
                                Remove Auction</button>
                            </div>
                        </li>
                    ))) : (
                        <p className="text-white/60 col-span-full text-center">No products found for the selected filter.</p>
                    )}
                </ul>
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button 
                            className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50"
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                        >First</button>
                        <button 
                            className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50"
                            onClick={() => setPage(page > 1 ? page - 1 : 1)}
                            disabled={page === 1}
                        >Previous</button>
                        <span className="text-white">
                            Page <span className="text-(--primary) font-bold">{page}</span> of <span className="text-(--primary) font-bold">{totalPages}</span>
                        </span>
                        <button 
                            className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50"
                            onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                            disabled={page === totalPages}
                        >Next</button>
                        <button 
                            className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50"
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages}
                        >Last</button>
                    </div>
                )}
            </div>
        </div>
    );
}
