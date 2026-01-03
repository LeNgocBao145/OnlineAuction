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
            await fetchProduct(id);
            if (user?.id) {
                await fetchFavorites(user.id);
            }
        })();
    }, [id, user?.id, pathname, refreshKey]);

    // Force refresh on component mount
    useEffect(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <div className="px-[10%] mt-6 text-white pb-20">
            {loading && !product && <p>Loading product...</p>}
            {error && <p className="text-red-400">{error}</p>}
            {product && <ProductBody />}
        </div>
    );
}