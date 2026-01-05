import { useState } from "react";
import { useNavigate } from "react-router";
import useSearchStore from "@/stores/searchStore";
import { formatTimeLeft } from "@/utils/timeUtils";
import { formatCurrency } from "@/utils/numberUtils";

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
                            // Client-side detection for New and Ending Soon
                            const parseSecureDate = (v: string) => {
                                if (!v.includes('Z') && !v.includes('+') && !v.match(/-\d{2}:?\d{2}$/)) {
                                    return v.replace(' ', 'T') + 'Z';
                                }
                                return v;
                            };
                            const now = new Date().getTime();
                            const expiry = item.expired_at ? new Date(parseSecureDate(item.expired_at)).getTime() : 0;
                            const created = item.created_at ? new Date(parseSecureDate(item.created_at)).getTime() : 0;

                            const secondsLeft = Math.floor((expiry - now) / 1000);
                            const secondsSinceCreated = Math.floor((now - created) / 1000);

                            const isEndingSoon = secondsLeft > 0 && secondsLeft <= 300;
                            const isNew = secondsSinceCreated >= 0 && secondsSinceCreated <= 300;

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-(--third) rounded-2xl p-6 flex flex-col h-full border-2 transition-all duration-300 relative group cursor-pointer \
                                        ${isEndingSoon ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]" :
                                            isNew ? "border-(--primary) shadow-[0_0_15px_rgba(255,215,0,0.1)]" :
                                                "border-white/5 hover:border-white/20"}`}
                                    onClick={() => navigate(`/product/${item.id}`)}
                                >
                                    {isEndingSoon ? (
                                        <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-20 animate-pulse uppercase flex items-center gap-1.5 border border-red-400">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                                            Ending Soon
                                        </div>
                                    ) : isNew ? (
                                        <div className="absolute -top-3 -right-3 bg-(--primary) text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-20 animate-bounce uppercase border border-yellow-400">
                                            New
                                        </div>
                                    ) : null}

                                    <div className="relative overflow-hidden rounded-lg mb-4">
                                        <img
                                            src={item.image || "/placeholder.jpg"}
                                            alt={item.name}
                                            className="w-full h-48 object-cover bg-(--secondary) transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {isEndingSoon && (
                                            <div className="absolute inset-0 bg-red-500/10 pointer-events-none group-hover:bg-red-500/20 transition-colors"></div>
                                        )}
                                    </div>

                                    <h2 className="text-xl font-bold text-white mb-2 truncate group-hover:text-(--primary) transition-colors">{item.name}</h2>

                                    <div className="flex justify-between mb-4">
                                        <div className="flex flex-col">
                                            <p className={`text-2xl font-bold ${isEndingSoon ? "text-red-400" : "text-(--primary)"}`}>
                                                {formatCurrency(item.current_price)}
                                            </p>
                                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">Current Price</p>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <p className="text-xl text-white font-semibold">{item.bid_count || 0}</p>
                                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">Bids</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-auto pt-4 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <p className={`text-sm font-bold ${isEndingSoon ? "text-red-400 animate-pulse" : "text-white"}`}>
                                                {formatTimeLeft(item.expired_at)}
                                            </p>
                                            <p className="text-white/40 text-[10px] uppercase tracking-widest">Time Left</p>
                                        </div>
                                        <div className="flex flex-col text-right justify-center">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <span className={`w-2 h-2 rounded-full ${item.state === "incoming"
                                                    ? "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                                                    : item.state === "bidding"
                                                        ? isEndingSoon ? "bg-red-500 animate-pulse" : "bg-green-400"
                                                        : "bg-red-500"
                                                    }`}
                                                ></span>
                                                <p className={`text-[10px] font-bold uppercase ${isEndingSoon ? "text-red-400" : "text-white/60"}`}>
                                                    {item.state === "incoming" ? "Incoming" : item.state === "bidding" ? (isEndingSoon ? "Urgent" : "Bidding") : "Sold"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-12 bg-white/5 p-4 rounded-xl border border-white/10">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={pagination.page === 1 || loading}
                                className="px-4 py-2 text-sm font-semibold text-white/60 hover:text-(--primary) disabled:opacity-30 transition-colors"
                            >
                                First
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1 || loading}
                                className="p-2 rounded-full border border-white/10 bg-white/5 text-white disabled:opacity-30 hover:bg-(--primary) hover:text-black transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <div className="flex gap-2">
                                <span className="px-4 py-2 rounded-lg bg-(--primary) text-black font-bold">
                                    {pagination.page}
                                </span>
                                <span className="px-2 py-2 text-white/40">of</span>
                                <span className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-bold">
                                    {pagination.totalPages}
                                </span>
                            </div>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages || loading}
                                className="p-2 rounded-full border border-white/10 bg-white/5 text-white disabled:opacity-30 hover:bg-(--primary) hover:text-black transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.totalPages)}
                                disabled={pagination.page === pagination.totalPages || loading}
                                className="px-4 py-2 text-sm font-semibold text-white/60 hover:text-(--primary) disabled:opacity-30 transition-colors"
                            >
                                Last
                            </button>
                        </div>
                    )}
                </>
            )}
        </div >
    );
}