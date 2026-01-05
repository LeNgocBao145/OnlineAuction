import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ProductBody from "./productBody";
import useProductStore from "@/stores/productStore";
import useAuthStore from "@/stores/authStore";
import useUserStore from "@/stores/userStore";

export default function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const { fetchProduct, loading, error, product } = useProductStore();
    const { user } = useAuthStore();
    const { fetchFavorites } = useUserStore();
    const { pathname } = useLocation();
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                await fetchProduct(id);
                if (user?.id) {
                    await fetchFavorites(user.id);
                }
            } catch (err) {
                console.error("Failed to load product page:", err);
            }
        })();
    }, [id, user?.id, pathname, refreshKey]);

    // Force refresh on component mount
    useEffect(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <div className="container mx-auto px-4 md:px-12 lg:px-24 mt-6 text-white pb-20 max-w-[1700px]">
            {loading && !product && (
                <div className="flex justify-center items-center py-20">
                    <p className="text-xl text-white/60">Loading product...</p>
                </div>
            )}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <p className="text-red-400 font-bold mb-2">Error</p>
                    <p className="text-white/80">{error}</p>
                    <button
                        onClick={() => setRefreshKey(prev => prev + 1)}
                        className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}
            {product && <ProductBody />}
        </div>
    );
}