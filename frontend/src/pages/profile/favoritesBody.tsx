import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FaStar } from "react-icons/fa";
import useUserStore from "@/stores/userStore";
import useAuthStore from "@/stores/authStore";
import { getImageUrl } from "@/utils/productUtils";
import { formatCurrency } from "@/utils/numberUtils";

export default function FavoritesBody() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { favorites, loading, error, fetchFavorites, unmarkFavorite } = useUserStore();
    const [statusFilter, setStatusFilter] = useState<number>(4);
    const [visibleCount, setVisibleCount] = useState<number>(5);
    const [page] = useState<number>(1);

    // Initial fetch when component mounts or user changes
    useEffect(() => {
        if (user?.id) {
            fetchFavorites(user.id, { page, limit: 10 });
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

    const products = favorites?.products || [];

    const filteredProducts = statusFilter === 4 ? products : products.filter(product => {
        if (statusFilter === 1) return product.state === "incoming";
        if (statusFilter === 2) return product.state === "bidding";
        if (statusFilter === 3) return product.state === "sold";
        return true;
    });

    const visibleProducts = filteredProducts.slice(0, visibleCount);

    const handleRemoveFavorite = async (productId: number) => {
        try {
            if (user?.id) {
                await unmarkFavorite(user.id, productId);
            }
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    }

    return (
        <div className="w-8/10 m-auto border border-white/10 rounded-lg p-6 bg-(--third) mt-10 flex flex-col justify-center">
            <h1 className="font-bold text-2xl text-(--primary)">Favorited Auctions</h1>
            <div className="flex items-center gap-4 mt-4 w-full">
                <p className="text-white/60">Filter by</p>
                <div className="grid lg:grid-cols-4 grid-cols-2 gap-2">
                    <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md ${statusFilter === 1 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(1)}>
                        Incoming</button>
                    <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md ${statusFilter === 2 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(2)}>
                        Bidding</button>
                    <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md ${statusFilter === 3 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(3)}>
                        Sold</button>
                    <button className={`bg-(--bgc) border border-white/10 p-2 rounded-md ${statusFilter === 4 ? "bg-(--primary) text-black" : "text-white"}`}
                        onClick={() => setStatusFilter(4)}>
                        View All</button>
                </div>
            </div>
            <ul className="grid grid-cols-1 lg:grid-cols-2 mt-4 gap-4 w-full">
                {visibleProducts.length > 0 ? visibleProducts.map((product) => (
                    <li key={product.id} className="border border-white/10 rounded-lg bg-(--secondary) p-4 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate(`/product/${product.id}`)}>
                        <div className="grid grid-cols-[1fr_2fr] gap-4">
                            <div>
                                <img src={getImageUrl(product.image) || "/placeholder.jpg"} alt={product.name} className="rounded-md border border-white/10 aspect-square h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-white font-bold text-xl">{product.name.length > 20 ? product.name.substring(0, 20) + "..." : product.name}</h2>
                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(Number(product.id)); }}>
                                            <FaStar className="inline w-4 h-4 text-yellow-400 mr-2" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-4">
                                    <div className="flex justify-between mb-4">
                                        <div className="flex flex-col">
                                            <p className="text-2xl text-(--primary)">{formatCurrency(product.current_price)}</p>
                                            <p className="text-white/60">Current Price</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-2xl text-white">{product.bid_count || 0}</p>
                                            <p className="text-white/60">Bids</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${product.state === "incoming"
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
                                                        : "Sold"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                )) : <p className="text-white/60">You don't have any favorites.</p>}
            </ul>
            {filteredProducts.length > visibleCount && (
                <button className="bg-(--primary) text-black p-2 rounded-md mt-4 w-3/10 m-auto"
                    onClick={() => setVisibleCount(visibleCount + 5)}>
                    Load More</button>
            )}
        </div>
    );
}