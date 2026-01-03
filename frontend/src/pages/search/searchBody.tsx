import { useState } from "react";
import { useNavigate } from "react-router";
import useSearchStore from "@/stores/searchStore";
import { formatTimeLeft } from "@/utils/timeUtils";

export default function SearchBody() {
    const navigate = useNavigate();
    const { data, loading, error, filterParams } = useSearchStore();
    const [sortBy, setSortBy] = useState<string>("time_left_desc,price_asc");

    const sortOptions: { label: string; value: string }[] = [
        { label: "Relevance", value: "time_left_desc,price_asc" },
        { label: "Price: Low to High", value: "price_asc" },
        { label: "Price: High to Low", value: "price_desc" },
        { label: "Recently Added", value: "newest" },
        { label: "Ending Soon", value: "time_left_asc" },
    ];

    const handlePageChange = (newPage: number) => {
        const { filterProducts } = useSearchStore.getState();
        filterProducts({
            ...filterParams,
            page: newPage,
        });
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        const { filterProducts } = useSearchStore.getState();
        filterProducts({
            ...filterParams,
            sort: newSort,
            page: 1, // Reset to first page when sorting changes
        });
    };

    if (error) {
        return (
            <div className="w-full p-4 mt-4">
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-300">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    const itemsData = data?.products || [];
    const pagination = data?.pagination;

    return (
        <div className="w-full p-4 mt-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold font-inter text-(--primary)">
                    {pagination ? `Search Results (${pagination.totalItems})` : "Search Results"}
                </h1>
                <div>
                    <label htmlFor="sortBy" className="text-white">Sort By:</label>
                    <select 
                        id="sortBy" 
                        value={sortBy}
                        onChange={handleSortChange}
                        className="text-white border border-white/10 bg-(--secondary) rounded-lg ml-2 p-2 cursor-pointer"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="w-full flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--primary)"></div>
                </div>
            ) : itemsData.length === 0 ? (
                <div className="w-full p-4 text-center">
                    <p className="text-white/60 text-lg">No products found. Try adjusting your filters.</p>
                </div>
            ) : (
                <>
                    <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(clamp(15rem,30dvw,20rem),1fr))] m-auto gap-4">
                        {itemsData.map((item) => {
                            const addedRecently = (() => {
                                const THIRTY_MIN_MS = 30 * 60 * 1000;
                                const addedDate = new Date(item.created_at).getTime();
                                const now = Date.now();
                                return (now - addedDate) <= THIRTY_MIN_MS;
                            })();
                            return <div key={item.id} className={`border border-white/10 rounded-xl bg-(--third) p-4 flex flex-col 
                            hover:scale-[1.02] transition-transform duration-200 cursor-pointer ${addedRecently ? "ring-2 ring-(--primary)" : ""}`}
                                onClick={() => navigate(`/product/${item.id}`)}
                            >
                                <img src={item.image || "/placeholder.jpg"} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4 bg-(--secondary) flex items-center justify-center text-white"/>
                                <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
                                <div className="flex justify-between mb-4">
                                    <div className="flex flex-col">
                                        <p className="text-2xl text-(--primary)">${item.current_price?.toFixed(2) || "0.00"}</p>
                                        <p className="text-white/60">Current Price</p>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <p className="text-[20px] text-white">{item.bid_count || 0}</p>
                                        <p className="text-white/60">Bids</p>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-[20px] text-white">{formatTimeLeft(item.time_left || "") || "N/A"}</p>
                                        <p className="text-white/60">Time Left</p>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <span className={`w-3 h-3 rounded-full ${
                                                item.state === "incoming"
                                                    ? "bg-yellow-400"
                                                    : item.state === "bidding"
                                                    ? "bg-green-400"
                                                    : "bg-red-500"
                                                }`}
                                            ></span>
                                            <p className="text-white/60">
                                                {item.state === "incoming"
                                                    ? "Incoming"
                                                    : item.state === "bidding"
                                                    ? "Bidding"
                                                    : "Sold"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-8">
                            <button 
                                onClick={() => handlePageChange(1)}
                                disabled={pagination.page === 1 || loading}
                                className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                First
                            </button>
                            <button 
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1 || loading}
                                className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                Previous
                            </button>
                            <span className="text-white">
                                Page <span className="text-(--primary) font-bold">{pagination.page}</span> of <span className="text-(--primary) font-bold">{pagination.totalPages}</span>
                            </span>
                            <button 
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages || loading}
                                className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                Next
                            </button>
                            <button 
                                onClick={() => handlePageChange(pagination.totalPages)}
                                disabled={pagination.page === pagination.totalPages || loading}
                                className="border border-white/10 hover:bg-(--primary) hover:text-black w-20 h-10 text-white bg-(--secondary) rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                Last
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}